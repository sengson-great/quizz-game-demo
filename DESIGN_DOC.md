# Millionaire Quiz Game - Design Document

## 1. Database Requirements & Schema

The application uses MySQL. Below is the relational schema design.

### Tables

**users**
- `id` (PK, BigInt)
- `name` (String)
- `email` (String, Unique)
- `password` (String)
- `role` (Enum: 'admin', 'player')
- `created_at`, `updated_at`, `deleted_at`

**categories**
- `id` (PK, BigInt)
- `name` (String)
- `description` (JustText)
- `created_at`, `updated_at`

**questions**
- `id` (PK, BigInt)
- `category_id` (FK -> categories.id)
- `text` (Text)
- `difficulty_level` (TinyInt: 1-15, representing prize ladder)
- `created_at`, `updated_at`, `deleted_at`

**answers**
- `id` (PK, BigInt)
- `question_id` (FK -> questions.id)
- `text` (String)
- `is_correct` (Boolean)
- `created_at`, `updated_at`

**game_sessions**
- `id` (PK, BigInt)
- `user_id` (FK -> users.id)
- `current_level` (Integer, 0-15)
- `score` (Decimal/Integer)
- `status` (Enum: 'active', 'completed', 'failed', 'timeout')
- `started_at` (Timestamp)
- `ended_at` (Timestamp, Nullable)
- `lifelines_used` (JSON: e.g., {"50_50": false, "skip": true})

**game_session_questions** (Pivot table to track history)
- `id` (PK, BigInt)
- `game_session_id` (FK -> game_sessions.id)
- `question_id` (FK -> questions.id)
- `given_answer_id` (FK -> answers.id, Nullable if skipped)
- `is_correct` (Boolean)
- `time_taken` (Integer, seconds)

### Relationships
- A `User` has many `GameSession`s.
- A `GameSession` belongs to a `User`.
- A `Question` belongs to a `Category` and has many `Answer`s.
- `GameSession` tracks used questions via `game_session_questions`.

## 2. API Routes (RESTful)

### Auth
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/user`

### Player - Game Flow
- `POST /api/games` (Start new game -> Create session, return Q1)
- `GET /api/games/{id}` (Get current state of game)
- `POST /api/games/{id}/answer` (Submit answer -> Verify -> Return result & next Q or Game Over)
- `POST /api/games/{id}/lifelines` (Use lifeline -> 50:50/Skip -> Return modified state)

### Admin - Management
- `GET /api/admin/questions`
- `POST /api/admin/questions`
- `PUT /api/admin/questions/{id}`
- `DELETE /api/admin/questions/{id}`
- `GET /api/admin/categories`
- ... (CRUD for categories)
- `GET /api/admin/stats` (Dashboard stats)

## 3. Game Progression Algorithm

1.  **Start Game:**
    - Create `GameSession` with `current_level = 1`.
    - Select random question where `difficulty_level = 1`.
    - Return Question + Answers (shuffled) + Timer start timestamp.

2.  **Submit Answer:**
    - Receive `answer_id`.
    - Check if `answer_id` belongs to `current_question`.
    - **If Correct:**
        - Increment `current_level`.
        - Calculate Prize (prize ladder array).
        - If `current_level > 15`, status = `completed`. Return "Win".
        - Ensure new level question hasn't been played in this session (though levels are unique per game usually).
        - Return Next Question.
    - **If Wrong:**
        - If `lifeline_double_chance` is active for this question, allow retry (decrement lifeline count, set flag).
        - Else, status = `failed`. Return "Game Over" + Correct Answer.
    - **If Timeout:**
        - Server verifies timestamp vs submit time (with buffer).
        - status = `timeout`.

3.  **Lifelines:**
    - **50:50:** Server identifies 2 wrong answers, returns their IDs to frontend to hide. Mark as used in DB.
    - **Skip:** Server marks current question as "skipped" (maybe correct but 0 points, or just advances level). Advances to next question of same or next difficulty? "Skip" usually means skip *this specific question*, so fetch another Q of *same* difficulty. Wait, prompt says "Skip question". In Millionaire, "Switch" swaps the question. "Skip" might mean pass without answering. I will implement as "Swap Question" (fetch another unused Q of same difficulty).
    - **Double Chance:** Set a flag on session `double_chance_active = true`. Logic in `Submit Answer` handles the check.

## 4. Example Controller Logic (Pseudocode)

```php
public function answer(Request $request, GameSession $session) {
    $question = $session->currentQuestion;
    $answer = Answer::find($request->answer_id);
    
    // Validation: Time check
    if (now()->diffInSeconds($session->last_question_sent_at) > 30) {
       $session->update(['status' => 'timeout']);
       return response()->json(['status' => 'game_over', 'reason' => 'timeout']);
    }

    if ($answer->is_correct) {
       $session->increment('current_level');
       $session->score = $this->calculateScore($session->current_level);
       $session->save();
       
       if ($session->current_level > 15) {
           $session->update(['status' => 'completed']);
           return response()->json(['status' => 'win', 'score' => $session->score]);
       }
       
       $nextQuestion = Question::where('difficulty_level', $session->current_level)->inRandomOrder()->first();
       // ... logic to prevent repeat ...
       
       return response()->json(['status' => 'correct', 'next_question' => $nextQuestion]);
    } else {
       // ... handle Double Chance checking ...
       $session->update(['status' => 'failed']);
       return response()->json(['status' => 'game_over', 'correct_answer' => $question->correct_answer_id]);
    }
}
```
