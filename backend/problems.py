"""Three chapters, five concepts per chapter, two interchangeable questions per concept.

The three original daily-practice exercises are retained. Other exercises are
new Arena curriculum additions, not recovered chat assignments.
"""
from backend.daily_problems import BY_ID as DAILY

CHAPTERS = [
    dict(id='arrays', title='Arrays & In-place', concepts=[
        dict(id='stable-partition', title='Stable rearrangement'),
        dict(id='reversal', title='Two-pointer reversal'),
        dict(id='rotation', title='Array rotation'),
        dict(id='running-values', title='Running values'),
        dict(id='subarrays', title='Contiguous subarrays')]),
    dict(id='maps', title='Hash Maps & Sets', concepts=[
        dict(id='last-seen', title='Last-seen positions'),
        dict(id='membership', title='Membership checks'),
        dict(id='counting', title='Frequency counting'),
        dict(id='complements', title='Complement lookup'),
        dict(id='grouping', title='Grouping by a key')]),
    dict(id='strings', title='Strings & Patterns', concepts=[
        dict(id='unique-characters', title='Character frequencies'),
        dict(id='palindromes', title='Two-pointer comparison'),
        dict(id='words', title='Word transformations'),
        dict(id='shared-edges', title='Shared prefixes and suffixes'),
        dict(id='windows', title='Sliding windows')]),
]

PROBLEMS = []

def add(chapter, concept, id, title, function, signature, description, cases,
        minutes=25, mode='return', hints=None):
    difficulty = {20:'Easy',25:'Easy',30:'Medium',35:'Medium',45:'Hard'}[minutes]
    p = dict(id=id, title=title, chapter_id=chapter, concept_id=concept,
             topic=next(c['title'] for c in CHAPTERS if c['id']==chapter),
             day='Chapter practice', difficulty=difficulty, minutes=minutes,
             description=description, function_name=function,
             starter=f'def {function}({signature}):\n    # Write your solution here\n    pass\n',
             cases=[dict(args=a,expected=e) for a,e in cases], example_count=2,
             constraints=['Inputs follow the types described in the statement.',
                          'Handle empty input and boundary cases.',
                          'Use the statement’s complexity target when one is given.'],
             prompts=['Explain your approach and the invariant you maintain.',
                      'Describe time and auxiliary space complexity.'],
             result_mode=mode, hints=hints or [])
    PROBLEMS.append(p)
    return p

# Each pair shares a concept and can replace the other after a timeout.
a=add('arrays','stable-partition','move-zeroes','Move Zeroes','move_zeroes','nums',
      'Move all zeroes to the end of nums, preserving nonzero order. Modify the original list in place with O(1) auxiliary space; your return value is ignored.',
      [([[0,1,0,3,12]],[1,3,12,0,0]), ([[1,2,3]],[1,2,3]), ([[]],[]), ([[0,0]],[0,0]), ([[-1,0,2]],[-1,2,0])],30,'mutated_first_arg')
add('arrays','stable-partition','move-value','Move a Value to the End','move_value','nums, value',
    'Move every occurrence of value to the end, preserving the order of all other integers. Modify nums in place using O(1) auxiliary space. Return value is ignored.',
    [([[2,1,2,3],2],[1,3,2,2]), ([[1,2,3],9],[1,2,3]), ([[],2],[]), ([[4,4],4],[4,4]), ([[-1,2,-1,3],-1],[2,3,-1,-1])],30,'mutated_first_arg')
add('arrays','reversal','reverse-array','Reverse an Array','reverse_array','nums',
    'Reverse nums in place using two pointers and O(1) extra space. Do not use reverse() or slicing; your return value is ignored.',
    [([[1,2,3]],[3,2,1]), ([[2,4]],[4,2]), ([[]],[]), ([[7]],[7]), ([[-1,0,2]],[2,0,-1])],20,'mutated_first_arg')
add('arrays','reversal','reverse-range','Reverse a Range','reverse_range','nums, left, right',
    'Reverse nums[left:right+1] in place using two pointers, leaving other values unchanged. Valid inclusive indices are supplied; nums is nonempty. Use O(1) extra space. Return value is ignored.',
    [([[1,2,3,4,5],1,3],[1,4,3,2,5]), ([[1,2],0,1],[2,1]), ([[3],0,0],[3]), ([[1,2,3],1,1],[1,2,3]), ([[1,2,3,4],0,3],[4,3,2,1])],20,'mutated_first_arg')
add('arrays','rotation','rotate-right','Rotate Right','rotate_right','nums, k',
    'Rotate nums right by k steps in place with O(1) auxiliary space. k is nonnegative and may exceed len(nums). Empty input stays empty. Return value is ignored.',
    [([[1,2,3,4],1],[4,1,2,3]), ([[1,2,3],4],[3,1,2]), ([[],5],[]), ([[7],8],[7]), ([[1,2,3],0],[1,2,3])],35,'mutated_first_arg')
add('arrays','rotation','rotate-left','Rotate Left','rotate_left','nums, k',
    'Rotate nums left by k steps in place with O(1) auxiliary space. k is nonnegative and may exceed len(nums). Empty input stays empty. Return value is ignored.',
    [([[1,2,3,4],1],[2,3,4,1]), ([[1,2,3],4],[2,3,1]), ([[],5],[]), ([[7],8],[7]), ([[1,2,3],0],[1,2,3])],35,'mutated_first_arg')
add('arrays','running-values','running-sum','Running Sum','running_sum','nums',
    'Return a new list where element i is the sum of nums[0:i+1]. Return [] for empty input.',
    [([[1,2,3]],[1,3,6]), ([[-1,2,0]],[-1,1,1]), ([[]],[]), ([[0,0]],[0,0]), ([[5]],[5])],25)
add('arrays','running-values','running-product','Running Product','running_product','nums',
    'Return a new list where element i is the product of nums[0:i+1]. Return [] for empty input.',
    [([[2,3,4]],[2,6,24]), ([[2,0,3]],[2,0,0]), ([[]],[]), ([[-1,2,-3]],[-1,-2,6]), ([[5]],[5])],25)
add('arrays','subarrays','max-subarray','Maximum Subarray Sum','max_subarray','nums',
    'Return the largest sum of a contiguous nonempty subarray. nums is nonempty. Aim for O(n) time and O(1) auxiliary space.',
    [([[-2,1,-3,4,-1,2,1,-5,4]],6), ([[-3,-1,-2]],-1), ([[1]],1), ([[0,0]],0), ([[2,-1,2]],3)],45)
add('arrays','subarrays','min-subarray','Minimum Subarray Sum','min_subarray','nums',
    'Return the smallest sum of a contiguous nonempty subarray. nums is nonempty. Aim for O(n) time and O(1) auxiliary space.',
    [([[3,-4,2,-3,-1,7,-5]],-6), ([[3,1,2]],1), ([[-1]],-1), ([[0,0]],0), ([[-2,1,-2]],-3)],45)

p=add('maps','last-seen','nearby-duplicate','First Duplicate Within K Positions','nearby_duplicate','nums: list[int], k: int',
      DAILY['nearby-duplicate']['description'],
      [(c['args'],c['expected']) for c in DAILY['nearby-duplicate']['cases']],25)
p.update({key:DAILY['nearby-duplicate'][key] for key in ['starter','constraints','prompts','example_count','day']})
add('maps','last-seen','nearby-character','Repeated Character Within K','nearby_character','text, k',
    'Return True if equal characters occur at distinct indices at most k positions apart; otherwise False. k is nonnegative. Characters are case-sensitive.',
    [(['abca',3],True), (['abca',2],False), (['',2],False), (['aa',0],False), (['abcc',1],True)],25)
add('maps','membership','contains-duplicate','Contains Duplicate','contains_duplicate','nums',
    'Return True if any integer occurs at least twice, otherwise False. Aim for O(n) average time using a set.',
    [([[1,2,1]],True), ([[1,2,3]],False), ([[]],False), ([[0,0]],True), ([[-1,2,-1]],True)],20)
add('maps','membership','first-duplicate','First Repeated Value','first_duplicate','nums',
    'Scan left to right and return the first value encountered that has already appeared. Return None if none repeats. This means earliest second occurrence, not smallest value.',
    [([[2,1,3,1,2]],1), ([[1,2,3]],None), ([[]],None), ([[0,0]],0), ([[-1,2,-1]],-1)],20)
add('maps','counting','count-integers','Count Integers','count_integers','nums',
    'Return a dictionary mapping each integer to its frequency. JSON displays integer keys as strings; return integer keys in Python.',
    [([[1,2,1]],{'1':2,'2':1}), ([[]],{}), ([[0,0]],{'0':2}), ([[-1,2,-1]],{'-1':2,'2':1}), ([[5]],{'5':1})],25)
add('maps','counting','count-words','Count Words','count_words','words',
    'Return a dictionary mapping each case-sensitive word in the list to its frequency. An empty list produces {}.',
    [([['cat','dog','cat']],{'cat':2,'dog':1}), ([[]],{}), ([['A','a']],{'A':1,'a':1}), ([['x']],{'x':1}), ([['','']],{'':2})],25)
add('maps','complements','two-sum','Two Sum Indices','two_sum','nums, target',
    'Return ascending indices of two distinct elements summing to target. Exactly one pair exists. Aim for O(n) average time.',
    [([[2,7,11],9],[0,1]), ([[3,2,4],6],[1,2]), ([[3,3],6],[0,1]), ([[-3,4,3],0],[0,2]), ([[0,4,3,0],0],[0,3])],30)
add('maps','complements','pair-sum','Pair Sum Exists','pair_sum','nums, target',
    'Return True if two distinct elements sum to target, else False. Aim for O(n) average time using remembered complements.',
    [([[2,7,11],9],True), ([[1,2],8],False), ([[],0],False), ([[3],6],False), ([[3,3],6],True)],30)
add('maps','grouping','group-anagrams','Group Anagrams','group_anagrams','words',
    'Group lowercase words that are anagrams. Return a list of groups: sort words inside each group alphabetically, then sort the groups lexicographically. Empty input produces [].',
    [([['eat','tea','tan','ate','nat','bat']],[['ate','eat','tea'],['bat'],['nat','tan']]), ([['a']],[['a']]), ([[]],[]), ([['','']],[['','']]), ([['ab','ba','ab']],[['ab','ab','ba']])],35)
add('maps','grouping','group-length','Group Words by Length','group_by_length','words',
    'Group words by length. Return groups ordered by increasing word length; sort words alphabetically within each group. Empty input produces [].',
    [([['pear','a','fig','b']],[['a','b'],['fig'],['pear']]), ([['x']],[['x']]), ([[]],[]), ([['','a']],[[''],['a']]), ([['bb','aa']],[['aa','bb']])],35)

p=add('strings','unique-characters','first-unique-char','First Non-Repeating Character','first_unique_char','s: str',
      DAILY['first-unique-char']['description'],[(c['args'],c['expected']) for c in DAILY['first-unique-char']['cases']],25)
p.update({key:DAILY['first-unique-char'][key] for key in ['starter','constraints','prompts','example_count','day']})
add('strings','unique-characters','last-unique-char','Last Non-Repeating Character','last_unique_char','s',
    'Return the index of the last character appearing exactly once in s, or -1 if none exists. s contains lowercase English letters. Aim for O(n) time without Counter or repeated count() calls.',
    [(['leetcode'],6), (['loveleetcode'],10), (['aabb'],-1), ([''],-1), (['a'],0)],25)
add('strings','palindromes','palindrome','Alphanumeric Palindrome','is_palindrome','text',
    'Return whether text is a palindrome after ignoring nonalphanumeric characters and case. Empty filtered text is a palindrome.',
    [(['A man, a plan, a canal: Panama'],True), (['race a car'],False), ([''],True), (['0P'],False), (['!?'],True)],20)
add('strings','palindromes','exact-palindrome','Exact Palindrome','exact_palindrome','text',
    'Return whether text reads identically forwards and backwards. All characters and case matter. Use two pointers without slicing. Empty text is a palindrome.',
    [(['abba'],True), (['Abba'],False), ([''],True), (['a'],True), (['abca'],False)],20)
add('strings','words','reverse-words','Reverse Word Order','reverse_words','text',
    'Reverse the order of whitespace-separated words. Join the result with single spaces and trim leading/trailing whitespace. Empty or whitespace-only input produces an empty string.',
    [(['the sky is blue'],'blue is sky the'), (['  hello   world '],'world hello'), ([''],''), (['   '],''), (['one'],'one')],30)
add('strings','words','reverse-each-word','Reverse Each Word','reverse_each_word','text',
    'Reverse the characters of each whitespace-separated word while keeping word order. Join with single spaces and trim whitespace. Empty input produces an empty string.',
    [(['hello world'],'olleh dlrow'), (['  ab   cd '],'ba dc'), ([''],''), (['x'],'x'), (['a bc'],'a cb')],30)
add('strings','shared-edges','common-prefix','Longest Common Prefix','common_prefix','words',
    'Return the longest prefix shared by all case-sensitive strings in words. Return an empty string for an empty list or when no prefix is shared.',
    [([['flower','flow','flight']],'fl'), ([['dog','racecar','car']],''), ([[]],''), ([['a']],'a'), ([['','abc']],'')],35)
add('strings','shared-edges','common-suffix','Longest Common Suffix','common_suffix','words',
    'Return the longest suffix shared by all case-sensitive strings in words. Return an empty string for an empty list or when no suffix is shared.',
    [([['running','walking','king']],'ing'), ([['cat','dog']],''), ([[]],''), ([['a']],'a'), ([['','abc']],'')],35)
add('strings','windows','longest-unique','Longest Unique Substring','longest_unique','text',
    'Return the length of the longest contiguous substring containing no repeated characters. Empty input gives 0. Aim for O(n) time using a sliding window.',
    [(['abcabcbb'],3), (['bbbbb'],1), ([''],0), (['pwwkew'],3), (['abba'],2)],45)
add('strings','windows','longest-two','At Most Two Distinct Characters','longest_two','text',
    'Return the length of the longest contiguous substring containing at most two distinct characters. Empty input gives 0. Aim for O(n) time using a sliding window.',
    [(['eceba'],3), (['ccaabbb'],5), ([''],0), (['aaaa'],4), (['abc'],2)],45)

HINTS = {
 'stable-partition':['Track the part of the list you have already placed correctly.', 'Try separate read and write positions. Preserve the order of kept values.', 'After placing kept values, the remaining positions must hold the moved value.'],
 'reversal':['Which two positions should exchange values first?', 'Move one pointer from the left and one from the right.', 'Stop when the pointers meet or cross; a temporary value or swap is enough.'],
 'rotation':['Rotating by the list length leaves it unchanged.', 'Normalize k with the length, but handle an empty list first.', 'Reversing sections can rotate a list without a second list. Work out the section boundaries on paper.'],
 'running-values':['What information from the previous prefix can you reuse?', 'Carry a running total or product while scanning.', 'Addition starts at 0; multiplication starts at 1. Append the updated accumulator.'],
 'subarrays':['At each index, compare extending the previous subarray with starting a new one.', 'Remember the best sum ending here separately from the best overall.', 'Initialize with the first element rather than 0 so all-negative or all-positive cases work.'],
 'last-seen':['A value’s latest index may be more useful than its first.', 'Check the gap before updating the remembered position.', 'Distinct indices mean a single value cannot match itself; k=0 cannot succeed.'],
 'membership':['Which structure answers “have I seen this?” quickly?', 'Scan from left to right and keep a set of seen values.', 'Check membership before adding the current value.'],
 'counting':['Each value can be a dictionary key.', 'Use a default count of 0 when the key is new.', 'Increment once per item. Empty input naturally leaves an empty dictionary.'],
 'complements':['If you know x, what other value would complete the target?', 'Look for target-x among previously seen values.', 'Check before adding x so you cannot reuse the same position.'],
 'grouping':['What common key describes all members of one group?', 'Use a dictionary whose values are lists.', 'Anagrams share sorted characters; equal-length words share a length. Apply the required output ordering at the end.'],
 'unique-characters':['You need the total count, not just whether a character has appeared.', 'Count characters in one pass, then inspect positions in the requested order.', 'Return an index only when its count is exactly 1. Return -1 if none qualifies.'],
 'palindromes':['Compare matching positions from opposite ends.', 'For the normalized version, decide which characters count before comparing.', 'Move both pointers inward after a match. A mismatch can return immediately.'],
 'words':['First separate the words from whitespace.', 'Decide whether the order of words or characters inside each word changes.', 'Joining with a single space also handles repeated or surrounding whitespace.'],
 'shared-edges':['A shared prefix or suffix cannot be longer than the shortest word.', 'Compare one aligned position across all words at a time.', 'Stop at the first mismatch. Empty lists and empty words need explicit handling.'],
 'windows':['Maintain a contiguous window rather than restarting from every index.', 'Expand the right edge and track character counts or positions.', 'When the rule breaks, move the left edge until the window is valid again; keep the largest valid length.'],
}
for p in PROBLEMS:
    p['hints'] = HINTS[p['concept_id']]
    p['day'] = next(c['title'] for c in CHAPTERS if c['id']==p['chapter_id'])
BY_ID = {p['id']: p for p in PROBLEMS}
