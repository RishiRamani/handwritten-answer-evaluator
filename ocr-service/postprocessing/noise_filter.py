import re

# Define known good acronyms
KNOWN_ACRONYMS = {'OSI', 'TCP', 'UDP', 'IP', 'HTTP', 'FTP', 'DNS', 'SMTP', 'FTP'}

def is_likely_noise(text, confidence):
    """
    Determine if an OCR block is likely noise.
    Returns True if it should be filtered out.
    """
    text = text.strip()
    
    # Always filter very low confidence blocks
    if confidence < 0.3:
        return True
    
    # Filter pure gibberish (no vowels, all caps, not a known acronym)
    if len(text) >= 3:
        # Count vowels
        vowel_count = sum(1 for c in text.lower() if c in 'aeiou')
        # If the text has no vowels and is all consonants, likely noise
        if vowel_count == 0 and re.match(r'^[A-Z]+$', text):
            # Known acronyms to keep
            if text not in KNOWN_ACRONYMS:
                return True
    
    # Filter text with too many special characters
    special_chars = sum(1 for c in text if not c.isalnum() and c not in ' .,!?-:')
    if len(text) > 2 and special_chars / len(text) > 0.3:
        return True
    
    # Filter text that's just dots, dashes, etc.
    if re.match(r'^[.\-]+$', text):
        return True
    
    # Filter text with strange character patterns (like "Da......")
    if re.match(r'^[A-Za-z]+\.{2,}$', text):
        return True
    
    # Filter mixed alphanumeric gibberish like "2a25"
    if len(text) >= 2:
        letters = sum(1 for c in text if c.isalpha())
        digits = sum(1 for c in text if c.isdigit())
        if letters > 0 and digits > 0:
            if letters + digits == len(text) and not re.match(r'^[A-Za-z]+\d*$', text):
                return True
    
    # NEW: Filter text with repeated characters that look like random keyboard spam
    if len(text) >= 4:
        # Check if text has unusual character patterns
        if re.match(r'^[A-Z]{4,}$', text) and text not in KNOWN_ACRONYMS:
            # All caps, length >= 4, not a known acronym -> likely noise
            return True
    
    # NEW: Filter text that is just random consonants with no vowels
    if len(text) >= 4:
        if re.match(r'^[BCDFGHJKLMNPQRSTVWXYZ]+$', text, re.IGNORECASE):
            # All consonants, no vowels
            return True
    
    return False

def clean_blocks(blocks):
    """
    Remove noisy OCR blocks and clean up remaining text.
    """
    cleaned_blocks = []
    
    for block in blocks:
        text = block['text'].strip()
        confidence = block['confidence']
        
        # Skip if likely noise
        if is_likely_noise(text, confidence):
            continue
        
        # Only do safe cleaning: normalize whitespace
        text = ' '.join(text.split())
        
        block['text'] = text
        cleaned_blocks.append(block)
    
    return cleaned_blocks