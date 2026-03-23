<?php

namespace App\Services;

use App\Models\GameSession;
use App\Models\Question;
use App\Models\Answer;
use App\Models\GameSessionQuestion;
use Illuminate\Support\Facades\DB;

class GameService
{
    private $prizeLadder = [
        1 => 500,
        2 => 1000,
        3 => 2000,
        4 => 3000,
        5 => 5000,
        6 => 7500,
        7 => 10000,
        8 => 12500,
        9 => 15000,
        10 => 25000,
        11 => 50000,
        12 => 100000,
        13 => 250000,
        14 => 500000,
        15 => 1000000
    ];

    public function createSession($user, $matchId = null)
    {
        // For multiplayer: reuse an existing active session for the same match.
        // This prevents duplicate sessions if the player refreshes or reconnects.
        if ($matchId) {
            $existing = GameSession::where('user_id', $user->id)
                ->where('match_id', $matchId)
                ->whereIn('status', ['active'])
                ->first();

            if ($existing) {
                return $existing;
            }
        }

        $session = GameSession::create([
            'user_id'       => $user->id,
            'match_id'      => $matchId,
            'current_level' => 1,
            'score'         => 0,
            'status'        => 'active',
            'lifelines'     => [
                'fiftyFifty' => true, 
                'skip' => true, 
                'doubleChance' => true,
                'audienceVote' => true,
                'phoneFriend' => true
            ],
            'started_at'    => now(),
        ]);

        return $session;
    }

    public function getNextQuestion(GameSession $session)
    {
        // 1. Check if this is a multiplayer match with pre-defined questions
        if ($session->match_id) {
            $match = \App\Models\GameMatch::find($session->match_id);
            // JSON object keys are always decoded as strings in PHP, so cast level to string for lookup
            $levelKey = (string) $session->current_level;
            if ($match && $match->questions && isset($match->questions[$levelKey])) {
                $questionId = $match->questions[$levelKey];
                
                $question = Question::with([
                    'answers' => function ($q) {
                        $q->select('id', 'question_id', 'text')->orderBy('id');
                    }
                ])->find($questionId);

                if ($question) {
                    $seed = crc32($session->match_id . $session->current_level);
                    mt_srand($seed);
                    
                    $answers = $question->answers->all();
                    $count = count($answers);
                    for ($i = $count - 1; $i >= 1; $i--) {
                        $j = mt_rand(0, $i);
                        $temp = $answers[$i];
                        $answers[$i] = $answers[$j];
                        $answers[$j] = $temp;
                    }
                    $question->setRelation('answers', collect($answers));
                    mt_srand(); // reset seed
                }
                
                return $question;
            }
        }

        // 2. Default: random question for the level
        // Get already used questions
        $usedQuestionIds = GameSessionQuestion::where('game_session_id', $session->id)
            ->pluck('question_id')->toArray();

        // Map current level to difficulty
        $difficulty = 'easy';
        if ($session->current_level > 5 && $session->current_level <= 10) {
            $difficulty = 'medium';
        } elseif ($session->current_level > 10) {
            $difficulty = 'hard';
        }

        // Difficulty matches current level
        $question = Question::where('difficulty_level', $difficulty)
            ->whereNotIn('id', $usedQuestionIds)
            ->with([
                'answers' => function ($q) {
                    $q->select('id', 'question_id', 'text')->inRandomOrder(); // Hide is_correct
                }
            ])
            ->inRandomOrder()
            ->first();

        return $question;
    }

    public function processAnswer(GameSession $session, $answerId)
    {
        $answer = Answer::find($answerId);

        // Log answer
        // Note: For Double Chance, we need to know if this is a retry.
        // If double chance active, check if previously failed THIS question?
        // Actually, Double Chance means if fail, get another try immediately.
        // Session needs to track "double_chance_active_for_question_id".
        // Simpler: Just rely on frontend for retry logic? No, secure.
        // Let's assume standard flow first.

        $isCorrect = $answer->is_correct;

        // Check if double chance active
        // Implemented by storing flag in session or separate state.
        // For simplicity: If wrong, check lifelines state or session temp meta.
        // Complex logic omitted for cleaner demo.

        if ($isCorrect) {
            $score = $this->prizeLadder[$session->current_level] ?? 0;
            $session->score = $score;

            GameSessionQuestion::create([
                'game_session_id' => $session->id,
                'question_id' => $answer->question_id,
                'answer_id' => $answerId,
                'is_correct' => true,
                'time_taken' => 0 // passed from controller ideally
            ]);

            if ($session->current_level >= 15) {
                $session->status = 'completed';
                $session->ended_at = now();
            } else {
                $session->current_level += 1;
            }
            $session->save();

            return ['status' => 'correct', 'score' => $score];
        } else {
            // Check double chance
            $lifelines = $session->lifelines;
            if (isset($lifelines['doubleChance']) && $lifelines['doubleChance'] === 'active') {
                // Consume it
                $lifelines['doubleChance'] = false;
                $session->lifelines = $lifelines;
                $session->save();

                GameSessionQuestion::create([
                    'game_session_id' => $session->id,
                    'question_id' => $answer->question_id,
                    'answer_id' => $answerId,
                    'is_correct' => false,
                    'time_taken' => 0
                ]);

                return ['status' => 'try_again'];
            }

            GameSessionQuestion::create([
                'game_session_id' => $session->id,
                'question_id' => $answer->question_id,
                'answer_id' => $answerId,
                'is_correct' => false,
                'time_taken' => 0
            ]);

            $session->status = 'failed';
            $session->ended_at = now();
            $session->save();

            return ['status' => 'wrong', 'correct_answer' => $answer->question->correctAnswer->id];
        }
    }

    public function useLifeline(GameSession $session, $type, $questionId = null)
    {
        $lifelines = $session->lifelines ?? [];

        // Check if already used
        if (isset($lifelines[$type]) && $lifelines[$type] === false) {
            return ['error' => 'Lifeline already used'];
        }

        // Logic specific to type state
        if ($type === 'doubleChance') {
            $lifelines[$type] = 'active';
        } else {
            $lifelines[$type] = false;
        }

        $session->lifelines = $lifelines;
        $session->save();

        if ($type === 'fiftyFifty') {
            if (!$questionId)
                return ['error' => 'Question ID required'];

            // Logic: Find 2 wrong answers for this question
            $question = Question::find($questionId);
            if (!$question)
                return ['error' => 'Question not found'];

            $correctAnswer = $question->answers()->where('is_correct', true)->first();
            $wrongAnswers = $question->answers()->where('is_correct', false)->inRandomOrder()->take(2)->pluck('id');

            return ['status' => 'ok', 'hidden_ids' => $wrongAnswers];
        }

        if ($type === 'skip') {
            // Logic: move to next question (same level, different question)
            // But we can't easily "skip" without answering or recording it.
            // Simplified: Just return a new random question for the same level.
            // But we should probably mark the "skipped" question as "seen" so it doesn't appear again?
            // For now, let's just get another random one.
            if ($questionId) {
                // Ideally add to session_questions as skipped?
                GameSessionQuestion::create([
                    'game_session_id' => $session->id,
                    'question_id' => $questionId,
                    'is_correct' => null, // null = skipped
                    'time_taken' => 0
                ]);
            }

            $nextQuestion = $this->getNextQuestion($session);
            return ['status' => 'ok', 'next_question' => $nextQuestion];
        }

        if ($type === 'audienceVote') {
            if (!$questionId) return ['error' => 'Question ID required'];
            $question = Question::find($questionId);
            if (!$question) return ['error' => 'Question not found'];

            $answers = $question->answers;
            $correctId = $answers->where('is_correct', true)->first()->id;
            
            $percentages = [];
            $remaining = 100;
            $correctPercent = mt_rand(40, 75);
            $percentages[$correctId] = $correctPercent;
            $remaining -= $correctPercent;

            $wrongAnswers = tap($answers->where('is_correct', false)->pluck('id'))->shuffle()->toArray();
            
            foreach ($wrongAnswers as $index => $id) {
                if ($index === count($wrongAnswers) - 1) {
                    $percentages[$id] = $remaining;
                } else {
                    $share = mt_rand(0, $remaining);
                    $percentages[$id] = $share;
                    $remaining -= $share;
                }
            }
            return ['status' => 'ok', 'vote_data' => $percentages];
        }

        if ($type === 'phoneFriend') {
            if (!$questionId) return ['error' => 'Question ID required'];
            $question = Question::find($questionId);
            if (!$question) return ['error' => 'Question not found'];

            $correctAnswer = $question->answers->where('is_correct', true)->first();
            $messages = [
                "I'm pretty sure the answer is: " . $correctAnswer->text,
                "I think it's " . $correctAnswer->text . ", but I'm not 100% sure.",
                "Oh, I know this one! It's definitely " . $correctAnswer->text . ".",
            ];
            return ['status' => 'ok', 'friend_advice' => $messages[array_rand($messages)]];
        }

        return ['status' => 'ok'];
    }
}
