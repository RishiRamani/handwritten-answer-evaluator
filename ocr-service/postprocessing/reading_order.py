def get_bbox_center_y(block):
    """
    Get the vertical center of an OCR block's bounding box.
    """
    x1, y1, x2, y2 = block["bbox"]
    return (y1 + y2) / 2


def get_bbox_height(block):
    """
    Get the height of an OCR block.
    """
    x1, y1, x2, y2 = block["bbox"]
    return y2 - y1


def get_bbox_center_x(block):
    """
    Get the horizontal center of an OCR block's bounding box.
    """
    x1, y1, x2, y2 = block["bbox"]
    return (x1 + x2) / 2


def are_same_line(block1, block2, tolerance=0.5):
    """
    Determine whether two OCR blocks are likely to belong
    to the same visual line.

    tolerance represents the allowed vertical difference
    relative to the average height of the two blocks.
    """

    center_y1 = get_bbox_center_y(block1)
    center_y2 = get_bbox_center_y(block2)

    height1 = get_bbox_height(block1)
    height2 = get_bbox_height(block2)

    average_height = (height1 + height2) / 2

    vertical_difference = abs(center_y1 - center_y2)

    return vertical_difference <= average_height * tolerance


def reconstruct_reading_order(blocks):
    """
    Group OCR blocks into lines and reconstruct their
    natural reading order.

    Returns a list of lines, where each line contains
    the OCR blocks belonging to that line.
    """

    if not blocks:
        return []

    # Start by sorting blocks roughly from top to bottom.
    sorted_blocks = sorted(
        blocks,
        key=get_bbox_center_y
    )

    lines = []

    for block in sorted_blocks:

        placed = False

        for line in lines:

            # Compare with the first block in the line.
            if are_same_line(block, line[0]):
                line.append(block)
                placed = True
                break

        if not placed:
            lines.append([block])

    # Sort blocks inside each line from left to right.
    for line in lines:
        line.sort(
            key=lambda block: block["bbox"][0]
        )

    return lines