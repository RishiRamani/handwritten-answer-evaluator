import re

def detect_question_marker(text):
    """
    Detect if text contains a question marker (Q1, Q2, 1., 2., etc.)
    Returns (question_number, marker_type) or (None, None)
    """
    patterns = [
        (r'^Q\s*(\d+)', 'Q'),
        (r'^Q\.\s*(\d+)', 'Q.'),
        (r'^Q\)\s*(\d+)', 'Q)'),
        (r'^Q\:\s*(\d+)', 'Q:'),
        (r'^(\d+)\.', 'num.'),
        (r'^(\d+)\)', 'num)'),
        (r'^(\d+)\:', 'num:'),
        (r'^Question\s+(\d+)', 'Question'),
    ]
    
    text = text.strip()
    
    for pattern, marker_type in patterns:
        match = re.match(pattern, text, re.IGNORECASE)
        if match:
            question_num = int(match.group(1))
            return question_num, marker_type
    
    return None, None

def detect_answer_marker(text):
    """
    Detect if text contains an answer marker (Ans., Answer, etc.)
    Returns (True, answer_text_without_marker) or (False, None)
    """
    text = text.strip()
    patterns = [
        (r'^Ans\.?\s*[:.]?\s*(.*)', 'Ans.'),
        (r'^Answer\s*[:.]?\s*(.*)', 'Answer'),
        (r'^Ans\s*[:.]?\s*(.*)', 'Ans'),
    ]
    
    for pattern, _ in patterns:
        match = re.match(pattern, text, re.IGNORECASE)
        if match:
            return True, match.group(1).strip()
    
    return False, None

def segment_questions(lines):
    """
    Segment lines into questions and answers based on question markers.
    Answer starts at 'Ans.' and continues until the next question.
    """
    questions = []
    current_question = None
    current_question_lines = []
    current_answer_lines = []
    current_line_start = 0
    found_answer = False
    
    for line_idx, line in enumerate(lines):
        line_text = ' '.join(block['text'] for block in line)
        marker_line_text = ' '.join(block.get('marker_text', block['text']) for block in line)
        question_num, marker_type = detect_question_marker(marker_line_text)
        
        if question_num:
            # Save previous question
            if current_question is not None:
                questions.append({
                    'question_number': current_question,
                    'question_text': ' '.join(current_question_lines).strip(),
                    'answer_text': ' '.join(current_answer_lines).strip(),
                    'line_range': {
                        'start': current_line_start,
                        'end': line_idx - 1
                    }
                })
            
            # Start new question
            current_question = question_num
            current_question_lines = [line_text]
            current_answer_lines = []
            current_line_start = line_idx
            found_answer = False
            
        else:
            # This line belongs to the current question
            if current_question is not None:
                # Check if this line contains an answer marker
                has_answer_marker, answer_text = detect_answer_marker(marker_line_text)
                
                if has_answer_marker and not found_answer:
                    # Found the start of the answer
                    found_answer = True
                    if answer_text:
                        current_answer_lines.append(answer_text)
                    # Remove "Ans." from the last question line if it was included there
                    if current_question_lines and re.search(r'Ans\.?\s*[:.]?\s*', current_question_lines[-1], re.IGNORECASE):
                        current_question_lines[-1] = re.sub(r'Ans\.?\s*[:.]?\s*.*$', '', current_question_lines[-1], re.IGNORECASE).strip()
                        if not current_question_lines[-1]:
                            current_question_lines.pop()
                elif found_answer:
                    # Already in answer section - everything goes to answer
                    current_answer_lines.append(line_text)
                else:
                    # No answer marker found yet - still in question section
                    current_question_lines.append(line_text)
            else:
                # No question detected yet, skip (header/noise)
                pass
    
    # Don't forget the last question
    if current_question is not None:
        questions.append({
            'question_number': current_question,
            'question_text': ' '.join(current_question_lines).strip(),
            'answer_text': ' '.join(current_answer_lines).strip(),
            'line_range': {
                'start': current_line_start,
                'end': len(lines) - 1
            }
        })
    
    return questions

def extract_question_answers(blocks, clean_noise=True):
    """
    Main function to extract question-answer pairs from OCR blocks.
    """
    from postprocessing.reading_order import reconstruct_reading_order
    from postprocessing.noise_filter import clean_blocks
    
    if clean_noise:
        blocks = clean_blocks(blocks)
    
    lines = reconstruct_reading_order(blocks)
    qa_pairs = segment_questions(lines)
    
    return qa_pairs, lines