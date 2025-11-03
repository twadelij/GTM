# 🎮 Gameplay Verification

## Current Implementation Status: ✅ CORRECT

### Requirements vs Implementation

#### ✅ 1. Start with 10 Random Movies
**Requirement:** Start met 10 willekeurige films  
**Implementation:** `this.allMovies = this.currentSession.movies.slice(0, 10);`  
**Status:** ✅ CORRECT

#### ✅ 2. 6 Rounds to Guess All Movies
**Requirement:** 6 rondes om alle films te raden  
**Implementation:** Rounds 1-6 with progressive elimination  
**Status:** ✅ CORRECT

#### ✅ 3. Points per Round
**Requirement:**
- Ronde 1: 5 punten + tijdbonus
- Ronde 2: 4 punten + tijdbonus
- Ronde 3: 3 punten + tijdbonus
- Ronde 4: 2 punten + tijdbonus
- Ronde 5: 1 punt + tijdbonus
- Ronde 6: 0 punten (geen punten/tijdbonus)

**Implementation:**
```javascript
const basePoints = Math.max(0, 6 - currentRound);
// Round 1: 6 - 1 = 5 ✓
// Round 2: 6 - 2 = 4 ✓
// Round 3: 6 - 3 = 3 ✓
// Round 4: 6 - 4 = 2 ✓
// Round 5: 6 - 5 = 1 ✓
// Round 6: 6 - 6 = 0 ✓
```
**Status:** ✅ CORRECT

#### ✅ 4. Time Bonus
**Requirement:** 1 punt per seconde over (niet in ronde 6)  
**Implementation:**
```javascript
const timeBonus = (currentRound < 6) ? this.timeLeft : 0;
```
**Status:** ✅ CORRECT

#### ✅ 5. Progressive Elimination
**Requirement:** Foute antwoorden gaan door naar de volgende ronde  
**Implementation:**
```javascript
if (isCorrect) {
    this.correctMovies.push(currentMovie);
} else {
    this.wrongMovies.push(currentMovie);
}
// Next round shows only wrongMovies
```
**Status:** ✅ CORRECT

#### ✅ 6. Fewer Choices per Round
**Requirement:** Minder keuzes per ronde (6 -> 5 -> 4 -> 3 -> 2 -> 1)  
**Implementation:**
```javascript
if (currentRound === 1) {
    maxChoices = 6;
} else {
    maxChoices = Math.max(1, 6 - currentRound + 1);
}
// Round 1: 6 choices ✓
// Round 2: 6-2+1 = 5 choices ✓
// Round 3: 6-3+1 = 4 choices ✓
// Round 4: 6-4+1 = 3 choices ✓
// Round 5: 6-5+1 = 2 choices ✓
// Round 6: 6-6+1 = 1 choice ✓
```
**Status:** ✅ CORRECT

## Complete Gameplay Flow

### Round 1
- **Movies:** All 10 movies from pool
- **Choices:** 6 per movie
- **Base Points:** 5
- **Time Bonus:** Yes (1 point/second)
- **Result:** Correct movies removed, wrong movies continue

### Round 2
- **Movies:** Only wrong movies from Round 1
- **Choices:** 5 per movie
- **Base Points:** 4
- **Time Bonus:** Yes (1 point/second)
- **Result:** Correct movies removed, wrong movies continue

### Round 3
- **Movies:** Only wrong movies from Round 2
- **Choices:** 4 per movie
- **Base Points:** 3
- **Time Bonus:** Yes (1 point/second)
- **Result:** Correct movies removed, wrong movies continue

### Round 4
- **Movies:** Only wrong movies from Round 3
- **Choices:** 3 per movie
- **Base Points:** 2
- **Time Bonus:** Yes (1 point/second)
- **Result:** Correct movies removed, wrong movies continue

### Round 5
- **Movies:** Only wrong movies from Round 4
- **Choices:** 2 per movie
- **Base Points:** 1
- **Time Bonus:** Yes (1 point/second)
- **Result:** Correct movies removed, wrong movies continue

### Round 6
- **Movies:** Only wrong movies from Round 5
- **Choices:** 1 per movie (only correct answer shown)
- **Base Points:** 0
- **Time Bonus:** No
- **Result:** Last chance to answer

## Example Gameplay Scenario

**Starting Pool:** 10 movies (A, B, C, D, E, F, G, H, I, J)

**Round 1 (6 choices, 5 points + time bonus):**
- Show all 10 movies
- Player answers: 7 correct (A, B, C, D, E, F, G), 3 wrong (H, I, J)
- Continue to Round 2 with: H, I, J

**Round 2 (5 choices, 4 points + time bonus):**
- Show 3 wrong movies: H, I, J
- Player answers: 2 correct (H, I), 1 wrong (J)
- Continue to Round 3 with: J

**Round 3 (4 choices, 3 points + time bonus):**
- Show 1 wrong movie: J
- Player answers: 1 correct (J)
- Game complete! All movies guessed correctly.

**Final Score:**
- Round 1: 7 × (5 + time bonus) = e.g., 7 × 25 = 175 points
- Round 2: 2 × (4 + time bonus) = e.g., 2 × 24 = 48 points
- Round 3: 1 × (3 + time bonus) = e.g., 1 × 23 = 23 points
- **Total:** 246 points

## Testing

✅ Test Suite Available: http://localhost:8888/static/test_progressive_elimination.html
✅ Console Logging: Detailed logs for debugging
✅ Answer Validation: Correct answer always included in choices

## Conclusion

**All gameplay requirements are fully implemented and working correctly.**

The game is ready to use with 10 movies. To scale to 20 movies, simply change:
```javascript
this.allMovies = this.currentSession.movies.slice(0, 20);
```

No other changes needed!
