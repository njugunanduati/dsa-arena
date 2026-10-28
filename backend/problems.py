"""Practice catalog adapted from the user's Daily Python DSA Practice chat.

Day 2/3 statements, signatures, examples, constraints and prompts come from
that chat. Move Zeroes is reconstructed from the shared implementation and
in-place follow-up. Additional edge cases are Arena validation cases.
"""

def problem(id, title, topic, day, description, function_name, signature,
            cases, constraints, prompts, example_count=3, minutes=25,
            result_mode='return'):
    return dict(
        id=id, title=title, topic=topic, day=day, difficulty='Easy–Medium',
        description=description, function_name=function_name,
        starter=f'def {function_name}({signature}):\n    # Write your solution here\n    pass\n',
        cases=[dict(args=args, expected=expected) for args, expected in cases],
        constraints=constraints, prompts=prompts, example_count=example_count,
        minutes=minutes, result_mode=result_mode,
    )

PROBLEMS = [
    problem(
        'move-zeroes', 'Move Zeroes', 'Arrays · In-place', 'In-place practice',
        'Move all zeroes to the end of nums while keeping the relative order of '
        'nonzero values. Modify the original list in place using O(1) auxiliary '
        'space. Arena checks the mutated list; your return value is ignored.',
        'move_zeroes', 'nums',
        [([[0, 1, 0, 3, 12]], [1, 3, 12, 0, 0]),
         ([[1, 2, 3]], [1, 2, 3]), ([[]], []), ([[0]], [0]),
         ([[0, 0, 0]], [0, 0, 0]),
         ([[-1, 0, -2, 0, 3]], [-1, -2, 3, 0, 0]),
         ([[0, 1, 0, 1, 0, 1]], [1, 1, 1, 0, 0, 0])],
        ['nums is a list of integers.', 'Target: O(n) time and O(1) auxiliary space.',
         'Do not build a second list. Preserve nonzero order.'],
        ['What makes an operation in-place?',
         'Why does returning nums + zeroes create a new list?',
         'How do you handle empty, all-zero, and already ordered lists?'],
        example_count=2, minutes=30, result_mode='mutated_first_arg',
    ),
    problem(
        'nearby-duplicate', 'First Duplicate Within K Positions', 'Hash maps and sets',
        'Day 2',
        'Given an integer array nums and an integer k, return True if two distinct '
        'indices contain the same value and are at most k positions apart; '
        'otherwise return False.',
        'nearby_duplicate', 'nums: list[int], k: int',
        [([[4, 2, 7, 4, 9], 3], True), ([[1, 2, 3, 1], 2], False),
         ([[5, 5, 8, 9], 1], True), ([[], 1], False), ([[1, 1], 0], False),
         ([[1, 2, 1, 1], 1], True), ([[-2, 0, -2], 2], True),
         ([[1], 100000], False)],
        ['0 <= len(nums) <= 100000', '-100000 <= nums[i] <= 100000',
         '0 <= k <= 100000', 'Target: O(n) time using a dictionary or set.'],
        ['Why did you choose a dictionary or set?',
         'What happens with an empty array or k = 0?',
         'What are the time and auxiliary space complexities?'],
    ),
    problem(
        'first-unique-char', 'First Non-Repeating Character', 'Strings and frequency maps',
        'Day 3',
        'Given a string s, return the index of the first character that appears '
        'exactly once in the entire string. If every character appears more than '
        'once, return -1.',
        'first_unique_char', 's: str',
        [(['leetcode'], 0), (['loveleetcode'], 2), (['aabbcc'], -1),
         ([''], -1), (['a'], 0), (['aabbc'], 4), (['abac'], 1),
         (['z' * 99999 + 'a'], 99999)],
        ['0 <= len(s) <= 100000', 's contains lowercase English letters a–z only.',
         'Target: O(n) time. You may use a dictionary for character frequencies.',
         'Do not use collections.Counter or call s.count() inside a loop.'],
        ['How does your dictionary help identify unique characters?',
         'What happens with an empty string or a single character?',
         'What are the time and auxiliary space complexities?',
         'Bonus: write pytest tests in tests/test_strings.py for the three examples '
         'and at least two edge cases.'],
    ),
]
BY_ID = {p['id']: p for p in PROBLEMS}
