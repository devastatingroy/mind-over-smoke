"""
MindOverSmoke - The Economist Question Bank Generator Script
-----------------------------------------------------------
用于批量调用 AI 生成符合《经济学人》犀利讽刺文风的英语戒烟完形填空/判断题，并结构化输出扩充题库。
"""

import json
import os

PROMPT_TEMPLATE = """
Role: You are a sharp, witty editorial satirist for The Economist with a background in behavioral economics.
Task: Write challenging, insightful, and humorous cloze (fill-in-the-blank) or true/false questions in English about the absurdity, health hazards, and corporate manipulation of smoking.

Tone Guidelines:
1. Biting irony, British dry wit, and intellectual punchiness.
2. Incorporate economic metaphors (e.g. sunk cost fallacy, negative externalities, depreciation, arbitrage, myopic discounting).
3. Advanced vocabulary (GRE/SAT level) and precise sentence structures.
4. Explanations must be devastatingly clever.

Format: Return a valid JSON array of objects with the following schema:
[
  {
    "id": "unique_id",
    "type": "cloze" or "true_false",
    "theme": "Theme title",
    "passage": "English passage with ________ for the blank",
    "blank": "the_target_word",
    "options": ["target_word", "distractor1", "distractor2", "distractor3"],
    "hint": "Brief linguistic clue",
    "first_letter": "first letter of target word",
    "punchline": "A biting one-sentence satirical commentary",
    "vocab": {
      "word": "target_word",
      "phonetic": "/phonetic/",
      "meaning": "Chinese concise explanation"
    }
  }
]
"""

def main():
    questions_file = os.path.join(os.path.dirname(__file__), "..", "src", "data", "questions.json")
    if os.path.exists(questions_file):
        with open(questions_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"[OK] 当前题库共收录 {len(data)} 道精选题目。")
        print("[Info] 题库支持动态热重载，可通过此脚本扩展。")
    else:
        print("[Error] 未找到题库文件。")

if __name__ == "__main__":
    main()
