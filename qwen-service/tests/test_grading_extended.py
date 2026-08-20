"""
Extended Qwen grading test suite.

Run from qwen-service:

    python -m tests.test_grading_extended

This suite is intentionally broader than the original TCP tests.
It tests:
- definitions
- explanations
- comparisons
- partial answers
- short answers
- verbose answers
- paraphrasing
- factual contradictions
- irrelevant answers
- keyword-only / misleading answers

Expected scores are approximate human grading targets, not absolute
ground truth. The important metrics are the size and direction of
the errors, especially serious overgrading of wrong answers.
"""

import time

from app.evaluator import evaluate_answer
from app.schemas import EvaluationRequest


TESTS = [

    # =========================================================
    # COMPUTER NETWORKS
    # =========================================================

    {
        "name": "CN - TCP definition - correct",
        "question": "What is TCP?",
        "answer_key": (
            "TCP is a connection-oriented transport layer protocol "
            "that provides reliable and ordered delivery of data."
        ),
        "student_answer": (
            "TCP is a connection-oriented transport layer protocol "
            "that provides reliable and ordered delivery of data."
        ),
        "expected": 5,
    },
    {
        "name": "CN - TCP definition - partial",
        "question": "What is TCP?",
        "answer_key": (
            "TCP is a connection-oriented transport layer protocol "
            "that provides reliable and ordered delivery of data."
        ),
        "student_answer": (
            "TCP is a protocol used to transfer data between computers."
        ),
        "expected": 2,
    },
    {
        "name": "CN - TCP definition - false",
        "question": "What is TCP?",
        "answer_key": (
            "TCP is a connection-oriented transport layer protocol "
            "that provides reliable and ordered delivery of data."
        ),
        "student_answer": (
            "TCP is a connectionless protocol that provides unreliable "
            "delivery of packets."
        ),
        "expected": 0,
    },
    {
        "name": "CN - UDP vs TCP - correct",
        "question": "Differentiate between TCP and UDP.",
        "answer_key": (
            "TCP is connection-oriented and provides reliable ordered "
            "delivery, while UDP is connectionless and provides faster "
            "but unreliable delivery without guaranteed ordering."
        ),
        "student_answer": (
            "TCP establishes a connection and provides reliable, ordered "
            "delivery. UDP does not establish a connection and is faster "
            "but does not guarantee reliable or ordered delivery."
        ),
        "expected": 5,
    },
    {
        "name": "CN - UDP vs TCP - one-sided",
        "question": "Differentiate between TCP and UDP.",
        "answer_key": (
            "TCP is connection-oriented and provides reliable ordered "
            "delivery, while UDP is connectionless and provides faster "
            "but unreliable delivery without guaranteed ordering."
        ),
        "student_answer": (
            "TCP is reliable and connection-oriented."
        ),
        "expected": 2,
    },
    {
        "name": "CN - HTTP - unrelated",
        "question": "What is HTTP?",
        "answer_key": (
            "HTTP is an application-layer protocol used for transferring "
            "web resources between clients and servers."
        ),
        "student_answer": (
            "RAM is volatile memory used by the CPU to temporarily store "
            "data and instructions."
        ),
        "expected": 0,
    },

    # =========================================================
    # OPERATING SYSTEMS
    # =========================================================

    {
        "name": "OS - process definition - correct",
        "question": "What is a process in an operating system?",
        "answer_key": (
            "A process is a program in execution. It has its own execution "
            "state and resources managed by the operating system."
        ),
        "student_answer": (
            "A process is a program that is currently executing, along "
            "with its execution state and resources."
        ),
        "expected": 5,
    },
    {
        "name": "OS - process definition - short",
        "question": "What is a process in an operating system?",
        "answer_key": (
            "A process is a program in execution. It has its own execution "
            "state and resources managed by the operating system."
        ),
        "student_answer": (
            "A process is a program in execution."
        ),
        "expected": 2,
    },
    {
        "name": "OS - deadlock conditions - complete",
        "question": "What are the four necessary conditions for deadlock?",
        "answer_key": (
            "The four conditions are mutual exclusion, hold and wait, "
            "no preemption, and circular wait."
        ),
        "student_answer": (
            "The four conditions are mutual exclusion, hold and wait, "
            "no preemption, and circular wait."
        ),
        "expected": 5,
    },
    {
        "name": "OS - deadlock conditions - two of four",
        "question": "What are the four necessary conditions for deadlock?",
        "answer_key": (
            "The four conditions are mutual exclusion, hold and wait, "
            "no preemption, and circular wait."
        ),
        "student_answer": (
            "Two conditions are mutual exclusion and hold and wait."
        ),
        "expected": 2.5,
    },
    {
        "name": "OS - deadlock conditions - wrong",
        "question": "What are the four necessary conditions for deadlock?",
        "answer_key": (
            "The four conditions are mutual exclusion, hold and wait, "
            "no preemption, and circular wait."
        ),
        "student_answer": (
            "The conditions are paging, segmentation, fragmentation, "
            "and virtual memory."
        ),
        "expected": 0,
    },
    {
        "name": "OS - scheduling - paraphrase",
        "question": "What is round-robin CPU scheduling?",
        "answer_key": (
            "Round-robin scheduling assigns each process a fixed time "
            "quantum in cyclic order. When the quantum expires, the "
            "process is preempted and the next process gets the CPU."
        ),
        "student_answer": (
            "In round robin, processes take turns using the CPU. Each "
            "process gets a limited time slice, after which it is "
            "preempted so another process can run."
        ),
        "expected": 5,
    },

    # =========================================================
    # DBMS
    # =========================================================

    {
        "name": "DBMS - primary key - correct",
        "question": "What is a primary key?",
        "answer_key": (
            "A primary key is an attribute or set of attributes that "
            "uniquely identifies each row in a table. It cannot contain "
            "NULL values."
        ),
        "student_answer": (
            "A primary key uniquely identifies every record in a table "
            "and cannot contain NULL values."
        ),
        "expected": 5,
    },
    {
        "name": "DBMS - primary key - incomplete",
        "question": "What is a primary key?",
        "answer_key": (
            "A primary key is an attribute or set of attributes that "
            "uniquely identifies each row in a table. It cannot contain "
            "NULL values."
        ),
        "student_answer": (
            "A primary key uniquely identifies a row."
        ),
        "expected": 3,
    },
    {
        "name": "DBMS - normalization - correct",
        "question": "What is database normalization?",
        "answer_key": (
            "Normalization is the process of organizing data into related "
            "tables to reduce redundancy and improve data integrity."
        ),
        "student_answer": (
            "Normalization organizes database data into related tables "
            "to reduce duplicate data and improve consistency and integrity."
        ),
        "expected": 5,
    },
    {
        "name": "DBMS - normalization - keyword trap",
        "question": "What is database normalization?",
        "answer_key": (
            "Normalization is the process of organizing data into related "
            "tables to reduce redundancy and improve data integrity."
        ),
        "student_answer": (
            "Normalization increases redundancy by putting all data into "
            "one large table."
        ),
        "expected": 0,
    },
    {
        "name": "DBMS - SQL vs NoSQL - partial",
        "question": "Differentiate between SQL and NoSQL databases.",
        "answer_key": (
            "SQL databases are generally relational, use structured schemas, "
            "and commonly use SQL. NoSQL databases support flexible data "
            "models and are often designed for horizontal scalability."
        ),
        "student_answer": (
            "SQL databases are relational and use tables. NoSQL databases "
            "are non-relational and can use flexible data structures."
        ),
        "expected": 4,
    },
    {
        "name": "DBMS - transaction properties - short",
        "question": "What are ACID properties?",
        "answer_key": (
            "ACID stands for Atomicity, Consistency, Isolation, and "
            "Durability. These properties help ensure reliable database "
            "transactions."
        ),
        "student_answer": (
            "ACID means Atomicity, Consistency, Isolation and Durability."
        ),
        "expected": 5,
    },

    # =========================================================
    # OOP
    # =========================================================

    {
        "name": "OOP - encapsulation - correct",
        "question": "What is encapsulation in OOP?",
        "answer_key": (
            "Encapsulation is bundling data and the methods that operate "
            "on that data inside a class while restricting direct access "
            "to internal implementation details."
        ),
        "student_answer": (
            "Encapsulation combines data and related methods inside a "
            "class and can hide the internal data using access control."
        ),
        "expected": 5,
    },
    {
        "name": "OOP - encapsulation - incomplete",
        "question": "What is encapsulation in OOP?",
        "answer_key": (
            "Encapsulation is bundling data and the methods that operate "
            "on that data inside a class while restricting direct access "
            "to internal implementation details."
        ),
        "student_answer": (
            "Encapsulation means keeping data and methods together in a class."
        ),
        "expected": 3,
    },
    {
        "name": "OOP - inheritance - correct",
        "question": "What is inheritance?",
        "answer_key": (
            "Inheritance allows a class to acquire properties and methods "
            "from another class, promoting reuse and hierarchical design."
        ),
        "student_answer": (
            "Inheritance lets a derived class reuse and extend the "
            "properties and methods of a base class."
        ),
        "expected": 5,
    },
    {
        "name": "OOP - inheritance - wrong",
        "question": "What is inheritance?",
        "answer_key": (
            "Inheritance allows a class to acquire properties and methods "
            "from another class, promoting reuse and hierarchical design."
        ),
        "student_answer": (
            "Inheritance means hiding the internal implementation of a "
            "class from other classes."
        ),
        "expected": 0,
    },
    {
        "name": "OOP - polymorphism - short",
        "question": "What is polymorphism?",
        "answer_key": (
            "Polymorphism allows the same interface or operation to behave "
            "differently for different objects or types."
        ),
        "student_answer": (
            "Polymorphism means one interface can have different behaviors."
        ),
        "expected": 5,
    },
    {
        "name": "OOP - abstraction - irrelevant",
        "question": "What is abstraction in OOP?",
        "answer_key": (
            "Abstraction hides unnecessary implementation details and "
            "exposes only the essential features of an object."
        ),
        "student_answer": (
            "A constructor is a special function that initializes an object."
        ),
        "expected": 0,
    },

    # =========================================================
    # DSA
    # =========================================================

    {
        "name": "DSA - binary search - correct",
        "question": "Explain binary search.",
        "answer_key": (
            "Binary search works on a sorted array by repeatedly comparing "
            "the target with the middle element and discarding half of the "
            "remaining search space. Its time complexity is O(log n)."
        ),
        "student_answer": (
            "Binary search requires sorted data. It checks the middle "
            "element and eliminates half of the remaining elements each "
            "time. Its time complexity is O(log n)."
        ),
        "expected": 5,
    },
    {
        "name": "DSA - binary search - missing complexity",
        "question": "Explain binary search.",
        "answer_key": (
            "Binary search works on a sorted array by repeatedly comparing "
            "the target with the middle element and discarding half of the "
            "remaining search space. Its time complexity is O(log n)."
        ),
        "student_answer": (
            "Binary search works on a sorted array by checking the middle "
            "element and repeatedly removing half of the search space."
        ),
        "expected": 4,
    },
    {
        "name": "DSA - stack - correct",
        "question": "What is a stack?",
        "answer_key": (
            "A stack is a linear data structure that follows LIFO, meaning "
            "the last element inserted is the first one removed."
        ),
        "student_answer": (
            "A stack is a linear data structure that follows the LIFO "
            "principle: the most recently added element is removed first."
        ),
        "expected": 5,
    },
    {
        "name": "DSA - stack - confused with queue",
        "question": "What is a stack?",
        "answer_key": (
            "A stack is a linear data structure that follows LIFO, meaning "
            "the last element inserted is the first one removed."
        ),
        "student_answer": (
            "A stack follows FIFO, so the first element inserted is the "
            "first element removed."
        ),
        "expected": 0,
    },
    {
        "name": "DSA - BFS vs DFS - partial",
        "question": "Differentiate between BFS and DFS.",
        "answer_key": (
            "BFS explores a graph level by level and commonly uses a queue. "
            "DFS explores as deeply as possible before backtracking and "
            "commonly uses a stack or recursion."
        ),
        "student_answer": (
            "BFS uses a queue and explores nodes level by level. DFS uses "
            "recursion or a stack."
        ),
        "expected": 4,
    },
    {
        "name": "DSA - complexity - verbose correct",
        "question": "What is the time complexity of accessing an array element by index?",
        "answer_key": (
            "Accessing an array element by index takes O(1) time because "
            "the address can be calculated directly from the index."
        ),
        "student_answer": (
            "Array indexing is constant time, O(1). Since array elements "
            "are stored in contiguous memory, the system can calculate the "
            "address of the requested element directly from the base "
            "address and index. Therefore it does not need to scan the "
            "elements before the requested one."
        ),
        "expected": 5,
    },

    # =========================================================
    # COMPILER DESIGN
    # =========================================================

    {
        "name": "Compiler - compiler definition - correct",
        "question": "What is a compiler?",
        "answer_key": (
            "A compiler is a program that translates source code written "
            "in a high-level programming language into target code, while "
            "performing analysis and reporting errors."
        ),
        "student_answer": (
            "A compiler translates a high-level source program into target "
            "code and performs various analyses and error checks."
        ),
        "expected": 5,
    },
    {
        "name": "Compiler - compiler definition - too short",
        "question": "What is a compiler?",
        "answer_key": (
            "A compiler is a program that translates source code written "
            "in a high-level programming language into target code, while "
            "performing analysis and reporting errors."
        ),
        "student_answer": (
            "A compiler converts source code into machine code."
        ),
        "expected": 4,
    },
    {
        "name": "Compiler - phases - partial",
        "question": "List the major phases of a compiler.",
        "answer_key": (
            "The major phases include lexical analysis, syntax analysis, "
            "semantic analysis, intermediate code generation, code "
            "optimization, and target code generation."
        ),
        "student_answer": (
            "The phases include lexical analysis, syntax analysis, semantic "
            "analysis, and code generation."
        ),
        "expected": 3.5,
    },
    {
        "name": "Compiler - lexer/parser - correct",
        "question": "What is the role of lexical analysis?",
        "answer_key": (
            "Lexical analysis reads the source program and converts the "
            "character sequence into tokens, while removing or ignoring "
            "irrelevant whitespace and comments."
        ),
        "student_answer": (
            "The lexical analyzer scans the source code and groups "
            "characters into tokens for the parser. It also ignores "
            "things such as whitespace and comments."
        ),
        "expected": 5,
    },
    {
        "name": "Compiler - lexer/parser - confused",
        "question": "What is the role of lexical analysis?",
        "answer_key": (
            "Lexical analysis reads the source program and converts the "
            "character sequence into tokens, while removing or ignoring "
            "irrelevant whitespace and comments."
        ),
        "student_answer": (
            "Lexical analysis checks whether the tokens form a valid "
            "grammar according to the language syntax."
        ),
        "expected": 1,
    },
    {
        "name": "Compiler - unrelated answer",
        "question": "What is syntax analysis?",
        "answer_key": (
            "Syntax analysis, or parsing, checks whether the sequence of "
            "tokens follows the grammar of the programming language and "
            "builds a parse tree or similar structure."
        ),
        "student_answer": (
            "A linker combines object files and libraries into an executable."
        ),
        "expected": 0,
    },

    # =========================================================
    # MIXED / ADVERSARIAL
    # =========================================================

    {
        "name": "Mixed - keyword trap",
        "question": "What is a primary key?",
        "answer_key": (
            "A primary key uniquely identifies each row in a table and "
            "cannot contain NULL values."
        ),
        "student_answer": (
            "A primary key is used to duplicate rows and allows NULL values "
            "so that records can remain flexible."
        ),
        "expected": 0,
    },
    {
        "name": "Mixed - correct concise",
        "question": "What is encapsulation?",
        "answer_key": (
            "Encapsulation bundles data and methods together and restricts "
            "direct access to internal implementation details."
        ),
        "student_answer": (
            "Encapsulation bundles data and methods together while hiding "
            "internal details."
        ),
        "expected": 5,
    },
    {
        "name": "Mixed - correct plus irrelevant fluff",
        "question": "What is an operating system?",
        "answer_key": (
            "An operating system is system software that manages computer "
            "hardware and software resources and provides services to "
            "application programs."
        ),
        "student_answer": (
            "An operating system manages hardware and provides services "
            "to applications. Operating systems are very important in "
            "modern computers, and computers have changed society greatly. "
            "For example, people use computers for games, communication, "
            "education, banking, and entertainment."
        ),
        "expected": 4.5,
    },
    {
        "name": "Mixed - major error with correct keywords",
        "question": "What is virtual memory?",
        "answer_key": (
            "Virtual memory is a memory-management technique that gives "
            "processes the illusion of a large memory space by using disk "
            "storage in addition to physical RAM."
        ),
        "student_answer": (
            "Virtual memory is a memory-management technique that gives "
            "processes access to physical RAM only and completely avoids "
            "using secondary storage."
        ),
        "expected": 1,
    },
    {
        "name": "Mixed - answer different structure",
        "question": "What is normalization in DBMS?",
        "answer_key": (
            "Normalization organizes data into related tables to reduce "
            "redundancy and improve data integrity."
        ),
        "student_answer": (
            "The main purpose is to avoid storing the same information "
            "unnecessarily. Tables are decomposed into related tables so "
            "that updates remain consistent."
        ),
        "expected": 5,
    },
    {
        "name": "Mixed - completely unrelated",
        "question": "Explain inheritance in OOP.",
        "answer_key": (
            "Inheritance allows a derived class to acquire and extend "
            "properties and methods of a base class."
        ),
        "student_answer": (
            "Binary search has O(log n) time complexity because it halves "
            "the search space at each step."
        ),
        "expected": 0,
    },
]


def run_suite():
    print("=" * 78)
    print("             EXTENDED QWEN GRADING TEST SUITE")
    print("=" * 78)
    print(f"Tests: {len(TESTS)}")
    print()

    results = []
    total_expected = 0.0
    total_actual = 0.0
    total_abs_error = 0.0
    total_time = 0.0

    overgraded = 0
    undergraded = 0
    near_exact = 0

    for i, test in enumerate(TESTS, 1):
        print("-" * 78)
        print(f"[{i}/{len(TESTS)}] {test['name']}")
        print("-" * 78)

        request = EvaluationRequest(
            question=test["question"],
            answer_key=test["answer_key"],
            student_answer=test["student_answer"],
            max_marks=5,
        )

        start = time.perf_counter()

        try:
            result = evaluate_answer(request)
            elapsed = time.perf_counter() - start

            expected = float(test["expected"])
            actual = float(result.score)
            diff = actual - expected
            abs_error = abs(diff)

            total_expected += expected
            total_actual += actual
            total_abs_error += abs_error
            total_time += elapsed

            if diff > 0.25:
                overgraded += 1
            elif diff < -0.25:
                undergraded += 1
            else:
                near_exact += 1

            results.append({
                "name": test["name"],
                "expected": expected,
                "actual": actual,
                "diff": diff,
                "time": elapsed,
            })

            print(f"Expected score : {expected}/5")
            print(f"Qwen score     : {actual}/5")
            print(f"Difference     : {diff:+.2f}")
            print(f"Correctness    : {result.correctness}")
            print(f"Completeness   : {result.completeness}")
            print(f"Relevance      : {result.relevance}")
            print(f"Time           : {elapsed:.2f}s")
            print(f"Feedback       : {result.feedback}")

        except Exception as error:
            elapsed = time.perf_counter() - start
            total_time += elapsed

            print(f"ERROR: {error}")

            results.append({
                "name": test["name"],
                "expected": float(test["expected"]),
                "actual": None,
                "diff": None,
                "time": elapsed,
            })

    successful = [
        r for r in results
        if r["actual"] is not None
    ]

    print()
    print("=" * 78)
    print("                         SUMMARY")
    print("=" * 78)

    print(f"Total tests       : {len(TESTS)}")
    print(f"Successful        : {len(successful)}")
    print(f"Failed            : {len(TESTS) - len(successful)}")

    if successful:
        mae = total_abs_error / len(successful)
        avg_time = total_time / len(successful)

        print(f"Mean absolute error: {mae:.2f} marks")
        print(f"Average time       : {avg_time:.2f}s")
        print(f"Total time         : {total_time:.2f}s")
        print(f"Near exact (≤0.25): {near_exact}")
        print(f"Overgraded (>0.25): {overgraded}")
        print(f"Undergraded (<-0.25): {undergraded}")

    print()
    print("Worst cases:")
    print("-" * 78)

    worst = sorted(
        successful,
        key=lambda r: abs(r["diff"]),
        reverse=True,
    )[:10]

    for rank, result in enumerate(worst, 1):
        print(
            f"{rank:2}. {result['name']:<45} "
            f"Expected={result['expected']:.2f} "
            f"Got={result['actual']:.2f} "
            f"Diff={result['diff']:+.2f}"
        )

    print()
    print("All results:")
    print("-" * 78)

    for result in results:
        if result["actual"] is None:
            print(
                f"{result['name']:<50} ERROR"
            )
        else:
            print(
                f"{result['name']:<50} "
                f"Expected={result['expected']:.2f} "
                f"Qwen={result['actual']:.2f} "
                f"Diff={result['diff']:+.2f}"
            )

    print("=" * 78)


if __name__ == "__main__":
    run_suite()