"""Reference solutions used only by tests, never served by the catalog API."""
SOLUTIONS = {
'move-zeroes': '''def move_zeroes(nums):
 w=0
 for i in range(len(nums)):
  if nums[i]!=0:
   nums[w],nums[i]=nums[i],nums[w]
   w+=1''',
'move-value': '''def move_value(nums,value):
 w=0
 for i in range(len(nums)):
  if nums[i]!=value:
   nums[w],nums[i]=nums[i],nums[w]
   w+=1''',
'reverse-array': '''def reverse_array(nums):
 l,r=0,len(nums)-1
 while l<r:
  nums[l],nums[r]=nums[r],nums[l]
  l+=1
  r-=1''',
'reverse-range': '''def reverse_range(nums,left,right):
 while left<right:
  nums[left],nums[right]=nums[right],nums[left]
  left+=1
  right-=1''',
'rotate-right': '''def rotate_right(nums,k):
 if not nums: return
 k%=len(nums)
 def reverse(l,r):
  while l<r:
   nums[l],nums[r]=nums[r],nums[l]
   l+=1
   r-=1
 reverse(0,len(nums)-1)
 reverse(0,k-1)
 reverse(k,len(nums)-1)''',
'rotate-left': '''def rotate_left(nums,k):
 if not nums: return
 k%=len(nums)
 def reverse(l,r):
  while l<r:
   nums[l],nums[r]=nums[r],nums[l]
   l+=1
   r-=1
 reverse(0,k-1)
 reverse(k,len(nums)-1)
 reverse(0,len(nums)-1)''',
'running-sum': '''def running_sum(nums):
 total=0
 result=[]
 for x in nums:
  total+=x
  result.append(total)
 return result''',
'running-product': '''def running_product(nums):
 total=1
 result=[]
 for x in nums:
  total*=x
  result.append(total)
 return result''',
'max-subarray': '''def max_subarray(nums):
 best=ending=nums[0]
 for x in nums[1:]:
  ending=max(x,ending+x)
  best=max(best,ending)
 return best''',
'min-subarray': '''def min_subarray(nums):
 best=ending=nums[0]
 for x in nums[1:]:
  ending=min(x,ending+x)
  best=min(best,ending)
 return best''',
'nearby-duplicate': '''def nearby_duplicate(nums,k):
 seen={}
 for i,x in enumerate(nums):
  if x in seen and i-seen[x]<=k: return True
  seen[x]=i
 return False''',
'nearby-character': '''def nearby_character(text,k):
 seen={}
 for i,c in enumerate(text):
  if c in seen and i-seen[c]<=k: return True
  seen[c]=i
 return False''',
'contains-duplicate': '''def contains_duplicate(nums):
 return len(set(nums))!=len(nums)''',
'first-duplicate': '''def first_duplicate(nums):
 seen=set()
 for x in nums:
  if x in seen: return x
  seen.add(x)
 return None''',
'count-integers': '''def count_integers(nums):
 counts={}
 for n in nums: counts[n]=counts.get(n,0)+1
 return counts''',
'count-words': '''def count_words(words):
 counts={}
 for word in words: counts[word]=counts.get(word,0)+1
 return counts''',
 'two-sum': '''def two_sum(nums,target):
 seen={}
 for i,x in enumerate(nums):
  if target-x in seen: return [seen[target-x],i]
  seen[x]=i''',
'pair-sum': '''def pair_sum(nums,target):
 seen=set()
 for x in nums:
  if target-x in seen: return True
  seen.add(x)
 return False''',
'group-anagrams': '''def group_anagrams(words):
 groups={}
 for word in words: groups.setdefault(''.join(sorted(word)),[]).append(word)
 return sorted(sorted(group) for group in groups.values())''',
'group-length': '''def group_by_length(words):
 groups={}
 for word in words: groups.setdefault(len(word),[]).append(word)
 return [sorted(groups[k]) for k in sorted(groups)]''',
'first-unique-char': '''def first_unique_char(s):
 counts={}
 for c in s: counts[c]=counts.get(c,0)+1
 for i,c in enumerate(s):
  if counts[c]==1: return i
 return -1''',
'last-unique-char': '''def last_unique_char(s):
 counts={}
 for c in s: counts[c]=counts.get(c,0)+1
 for i in range(len(s)-1,-1,-1):
  if counts[s[i]]==1: return i
 return -1''',
'palindrome': '''def is_palindrome(text):
 s=''.join(c.lower() for c in text if c.isalnum())
 return s==s[::-1]''',
'exact-palindrome': '''def exact_palindrome(text):
 l,r=0,len(text)-1
 while l<r:
  if text[l]!=text[r]: return False
  l+=1
  r-=1
 return True''',
'reverse-words': '''def reverse_words(text):
 return ' '.join(text.split()[::-1])''',
'reverse-each-word': '''def reverse_each_word(text):
 return ' '.join(word[::-1] for word in text.split())''',
'common-prefix': '''def common_prefix(words):
 if not words: return ''
 result=''
 for i,c in enumerate(min(words,key=len)):
  if any(word[i]!=c for word in words): break
  result+=c
 return result''',
'common-suffix': '''def common_suffix(words):
 if not words: return ''
 result=''
 for i in range(1,len(min(words,key=len))+1):
  c=words[0][-i]
  if any(word[-i]!=c for word in words): break
  result=c+result
 return result''',
'longest-unique': '''def longest_unique(text):
 seen={}
 left=best=0
 for right,c in enumerate(text):
  if c in seen: left=max(left,seen[c]+1)
  seen[c]=right
  best=max(best,right-left+1)
 return best''',
'longest-two': '''def longest_two(text):
 counts={}
 left=best=0
 for right,c in enumerate(text):
  counts[c]=counts.get(c,0)+1
  while len(counts)>2:
   counts[text[left]]-=1
   if counts[text[left]]==0: del counts[text[left]]
   left+=1
  best=max(best,right-left+1)
 return best''',
}
