"use strict";
/**
 * Problem Set 1: Flashcards - Algorithm Functions
 *
 * This file contains the implementations for the flashcard algorithm functions
 * as described in the problem set handout.
 *
 * Please DO NOT modify the signatures of the exported functions in this file,
 * or you risk failing the autograder.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBucketSets = toBucketSets;
exports.getBucketRange = getBucketRange;
exports.practice = practice;
exports.update = update;
exports.getHint = getHint;
exports.computeProgress = computeProgress;
const flashcards_1 = require("./flashcards"); // assuming bucket with the highest key is a retired bucket
/**
 * Converts a Map representation of learning buckets into an Array-of-Set representation.
 *
 * @param buckets Map where keys are bucket numbers and values are sets of Flashcards.
 * @returns Array of Sets, where element at index i is the set of flashcards in bucket i.
 *          Buckets with no cards will have empty sets in the array.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
function toBucketSets(buckets) {
    // TODO: Implement this function
    if (buckets.size === 0) {
        return [];
    }
    if (buckets.size < 2 || !buckets.has(0)) {
        throw new Error("Buckets must include at least bucket 0 and a retired bucket");
    }
    let array = [];
    let lastbucket = 0;
    for (const number of buckets.keys()) { //lastbucket = order number of the final bucket, which is a retired bucket
        if (number > lastbucket) {
            lastbucket = number;
        }
    }
    for (let i = 0; i <= lastbucket; i++) { // creating array of empty sets
        array[i] = new Set();
    }
    // Fill the array with actual bucket contents
    for (const [bucketNum, cards] of buckets) {
        array[bucketNum] = cards;
    }
    return array;
}
/**
 * Finds the range of buckets that contain flashcards, as a rough measure of progress.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @returns object with minBucket and maxBucket properties representing the range,
 *          or undefined if no buckets contain cards.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
function getBucketRange(buckets) {
    var _a;
    let minBucket;
    let maxBucket;
    for (let i = 0; i < buckets.length; i++) {
        if (((_a = buckets[i]) !== null && _a !== void 0 ? _a : new Set()).size > 0) { // in case buckets[i] is undefined, we create a new empty set to falsify the condition instead of getting an error
            if (minBucket === undefined || i < minBucket) {
                minBucket = i;
            }
            if (maxBucket === undefined || i > maxBucket) {
                maxBucket = i;
            }
        }
    }
    return minBucket !== undefined && maxBucket !== undefined
        ? { minBucket, maxBucket }
        : undefined; // so if every bucket is empty, min max would be undefined and we return undefined
}
/**
 * Selects cards to practice on a particular day.
 *
 * @param buckets Array-of-Set representation of buckets.
 * @param day current day number (starting from 0).
 * @returns a Set of Flashcards that should be practiced on day `day`,
 *          according to the Modified-Leitner algorithm.
 * @spec.requires buckets is a valid Array-of-Set representation of flashcard buckets.
 */
function practice(buckets, day) {
    var _a;
    const practiceCards = new Set(); // Set to store cards to practice
    const actualDay = day + 1; // day is 0-indexed, but we want to start from 1 for the algorithm 
    for (let bucketIndex = 0; bucketIndex < buckets.length - 1; bucketIndex++) { // -1 because the last bucket is retired and should not be practiced
        if (buckets[bucketIndex] && actualDay % Math.pow(2, bucketIndex) === 0) { // bucket i should be practiced every 2^i days, so we check if dayNumber is divisible by 2^i
            ((_a = buckets[bucketIndex]) !== null && _a !== void 0 ? _a : new Set()).forEach(card => practiceCards.add(card)); // Add cards from the bucket to the practice set
        }
    }
    return practiceCards;
}
/**
 * Updates a card's bucket number after a practice trial.
 *
 * @param buckets Map representation of learning buckets.
 * @param card flashcard that was practiced.
 * @param difficulty how well the user did on the card in this practice trial.
 * @returns updated Map of learning buckets.
 * @spec.requires buckets is a valid representation of flashcard buckets.
 */
function update(buckets, card, difficulty) {
    // Create a new Map to maintain immutability
    const newBuckets = new Map(buckets);
    let currentBucket;
    // Find which bucket the card is currently in
    for (const [bucketNum, cards] of newBuckets.entries()) {
        if (cards.has(card)) {
            currentBucket = bucketNum;
            break;
        }
    }
    // If card wasn't found, return unchanged
    if (currentBucket === undefined) {
        return newBuckets;
    }
    // Find retired bucket number
    const retiredBucket = Math.max(...newBuckets.keys());
    // Remove card from current bucket
    const currentCards = newBuckets.get(currentBucket);
    currentCards.delete(card);
    if (currentCards.size === 0 && currentBucket !== 0 && currentBucket !== retiredBucket) { // if the current bucket is empty after removing the card, we remove the bucket from the map
        newBuckets.delete(currentBucket);
    }
    // Determine new bucket based on difficulty
    let newBucket;
    switch (difficulty) {
        case flashcards_1.AnswerDifficulty.Easy:
            if (currentBucket < retiredBucket) {
                newBucket = currentBucket + 1;
            }
            else {
                newBucket = retiredBucket; // already retired, stay
            }
            break;
        case flashcards_1.AnswerDifficulty.Hard:
            newBucket = Math.max(0, currentBucket - 1);
            break;
        case flashcards_1.AnswerDifficulty.Wrong:
            newBucket = 0;
            break;
        default:
            newBucket = currentBucket;
    }
    // Add card to new bucket
    const newCards = newBuckets.get(newBucket) || new Set(); // if we have deleted the bucket, we create a new empty set to add the card to
    newCards.add(card);
    newBuckets.set(newBucket, newCards);
    return newBuckets;
}
/**
 * Generates a hint for a flashcard.
 *
 * @param card flashcard to hint
 * @returns a hint for the front of the flashcard.
 * @spec.requires card is a valid Flashcard.
 */
// export function getHint(card: Flashcard): string {
//   if (!card.front || card.front.length === 0) {
//     return "";
//   }
//   // Show first half (rounded up) of the front text
//   const hintLength = Math.ceil(card.front.length / 2);
//   const shown = card.front.substring(0, hintLength);
//   const hidden = "_".repeat(card.front.length - hintLength);
//   return shown + hidden;
// }
function getHint(card) {
    if (!card.hint || card.hint.length === 0) {
        return "";
    }
    return card.hint;
}
/**
 * Computes statistics about the user's learning progress.
 *
 * @param buckets representation of learning buckets.
 * @param history representation of user's answer history.
 * @returns statistics about learning progress.
 * @spec.requires [SPEC TO BE DEFINED]
 */
function computeProgress(buckets, history) {
    var _a, _b;
    // Validate bucket structure
    if (buckets.size < 2 || !buckets.has(0)) {
        throw new Error("Buckets must include at least bucket 0 and a retired bucket");
    }
    const retiredBucket = Math.max(...buckets.keys());
    if (retiredBucket <= 0) {
        throw new Error("Must have a retired bucket with number > 0");
    }
    // Calculate basic stats
    let totalCards = 0;
    const cardsByBucket = {};
    for (let i = 0; i <= retiredBucket; i++) {
        const count = ((_a = buckets.get(i)) === null || _a === void 0 ? void 0 : _a.size) || 0;
        cardsByBucket[i] = count;
        totalCards += count;
    }
    // Calculate metrics
    const totalAnswers = history.length;
    const correctAnswers = history.filter(r => r.difficulty !== flashcards_1.AnswerDifficulty.Wrong).length;
    const successRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    // Track hardest cards
    const wrongCounts = new Map();
    history.forEach(r => {
        if (r.difficulty === flashcards_1.AnswerDifficulty.Wrong) {
            const key = `${r.cardFront}:${r.cardBack}`;
            const current = wrongCounts.get(key) || {
                card: new flashcards_1.Flashcard(r.cardFront, r.cardBack, "", []),
                count: 0
            };
            wrongCounts.set(key, Object.assign(Object.assign({}, current), { count: current.count + 1 }));
        }
    });
    const hardestCards = Array.from(wrongCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(x => x.card);
    // Calculate average moves
    const moveCounts = new Map();
    history.forEach(r => {
        const key = `${r.cardFront}:${r.cardBack}`;
        moveCounts.set(key, (moveCounts.get(key) || 0) + 1);
    });
    const averageMovesPerCard = moveCounts.size > 0
        ? Array.from(moveCounts.values()).reduce((a, b) => a + b, 0) / moveCounts.size
        : 0;
    return {
        totalCards,
        cardsByBucket,
        retiredCards: ((_b = buckets.get(retiredBucket)) === null || _b === void 0 ? void 0 : _b.size) || 0,
        successRate,
        hardestCards,
        averageMovesPerCard,
        totalPracticeEvents: totalAnswers
    };
}
