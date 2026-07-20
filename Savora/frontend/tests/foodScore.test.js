import test from "node:test";
import assert from "node:assert/strict";
import {
  computeFoodScore,
  foodScoreBand,
  rescueTimeLabel,
  rescueTimeParts,
} from "../src/lib/foodScore.js";

test("computeFoodScore returns the base score when the rescue window is full", () => {
  assert.equal(computeFoodScore(120, 120, 92), 92);
});

test("computeFoodScore falls to zero exactly at expiry", () => {
  assert.equal(computeFoodScore(0, 120, 92), 0);
});

test("computeFoodScore decreases as the remaining rescue time shrinks", () => {
  const full = computeFoodScore(120, 120, 100);
  const half = computeFoodScore(60, 120, 100);
  const nearlyGone = computeFoodScore(6, 120, 100);
  assert.ok(full > half, "half-window score should be lower than full");
  assert.ok(half > nearlyGone, "near-expiry score should be lowest");
});

test("computeFoodScore never exceeds the UMKM base score (ceiling)", () => {
  assert.ok(computeFoodScore(999, 120, 80) <= 80);
});

test("computeFoodScore clamps invalid inputs to a safe range", () => {
  const score = computeFoodScore(-50, 120, 100);
  assert.ok(score >= 0 && score <= 100);
});

test("foodScoreBand maps scores to the correct display band", () => {
  assert.equal(foodScoreBand(92).label, "Sangat Layak");
  assert.equal(foodScoreBand(70).label, "Layak");
  assert.equal(foodScoreBand(40).label, "Segera Ambil");
  assert.equal(foodScoreBand(10).label, "Kritis");
  assert.equal(foodScoreBand(0).label, "Kedaluwarsa");
});

test("rescueTimeLabel formats hours, minutes, and expiry", () => {
  assert.equal(rescueTimeLabel(2 * 3600 + 15 * 60), "2j 15m");
  assert.equal(rescueTimeLabel(45 * 60), "45m");
  assert.equal(rescueTimeLabel(0), "0d");
});

test("rescueTimeParts zero-pads hours, minutes, and seconds", () => {
  assert.deepEqual(rescueTimeParts(3661), { hours: "01", minutes: "01", seconds: "01" });
  assert.deepEqual(rescueTimeParts(-10), { hours: "00", minutes: "00", seconds: "00" });
});
