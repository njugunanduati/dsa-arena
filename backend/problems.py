def problem(id, title, topic, difficulty, description, signature, cases):
    return dict(id=id, title=title, topic=topic, difficulty=difficulty, description=description,
                starter=f'def solve({signature}):\n    # Write your solution here\n    pass\n',
                cases=[dict(args=a, expected=e) for a, e in cases])

PROBLEMS = [
    problem('two-sum', 'Two Sum', 'Hash maps', 'Easy', 'Return the indices of two numbers that add up to target, in ascending order. Exactly one answer exists; do not use an element twice.', 'nums, target', [([[2,7,11,15],9],[0,1]), ([[3,2,4],6],[1,2]), ([[3,3],6],[0,1]), ([[-3,4,3,90],0],[0,2])]),
    problem('palindrome', 'Valid Palindrome', 'Strings', 'Easy', 'Return whether text is a palindrome after keeping only alphanumeric characters and ignoring case. The empty string is a palindrome.', 'text', [(['A man, a plan, a canal: Panama'],True), (['race a car'],False), ([''],True), (['0P'],False)]),
    problem('max-subarray', 'Maximum Subarray', 'Arrays', 'Medium', 'Return the largest sum of a contiguous, nonempty subarray. nums contains at least one integer.', 'nums', [([[-2,1,-3,4,-1,2,1,-5,4]],6), ([[1]],1), ([[-3,-1,-2]],-1), ([[5,4,-1,7,8]],23)]),
    problem('brackets', 'Balanced Brackets', 'Stacks', 'Easy', 'Return whether brackets are balanced and correctly nested. Input contains only ()[]{}. An empty string is valid.', 'text', [(['()[]{}'],True), (['([)]'],False), ([''],True), (['{[()]}'],True), (['('],False)]),
    problem('binary-search', 'Binary Search', 'Search', 'Easy', 'Return the index of target in a sorted list of distinct integers, or -1 if absent. Use O(log n) time.', 'nums, target', [([[-1,0,3,5,9,12],9],4), ([[],1],-1), ([[1],1],0), ([[1,3],2],-1)]),
    problem('tree-depth', 'Maximum Tree Depth', 'Trees', 'Easy', 'Return the maximum depth of a binary tree represented as nested dictionaries with keys val, left, right. Missing children are null (None in Python). An empty tree has depth 0.', 'root', [([{'val':1,'left':{'val':2},'right':{'val':3}}],2), ([None],0), ([{'val':1}],1), ([{'val':1,'left':{'val':2,'left':{'val':3}}}],3)])
]
BY_ID = {p['id']: p for p in PROBLEMS}
