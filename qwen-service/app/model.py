from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


# ---------------------------------------------------------
# Model configuration
# ---------------------------------------------------------
# The model has already been downloaded locally using:
#
# hf download Qwen/Qwen3-1.7B --local-dir ./models/Qwen3-1.7B
#
# We therefore load it from disk instead of downloading it
# every time the service starts.
# ---------------------------------------------------------

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "Qwen3-1.7B"


# ---------------------------------------------------------
# Load tokenizer once
# ---------------------------------------------------------
# Loading the tokenizer for every request would be wasteful.
# We load it when this module is initialized and reuse it.
# ---------------------------------------------------------

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)


# ---------------------------------------------------------
# Load Qwen once
# ---------------------------------------------------------
# device_map="auto":
#   Lets Accelerate decide where model parameters should
#   live based on the available hardware.
#
# dtype="auto":
#   Uses the appropriate data type for the model/device.
#
# local_files_only=True:
#   Prevents accidental downloads from Hugging Face.
# ---------------------------------------------------------

model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    dtype="auto",
    device_map="auto",
    local_files_only=True
)

model.eval()


def generate_response(
    prompt: str,
    max_new_tokens: int = 256
) -> str:
    """
    Send a prompt to Qwen and return only the generated text.

    This function intentionally knows nothing about grading.
    Its only responsibility is model inference.
    """

    # Qwen uses a chat format, so wrap our evaluator prompt
    # as a user message.
    messages = [
        {
            "role": "user",
            "content": prompt
        }
    ]

    # Convert the chat messages into the format expected
    # by the Qwen tokenizer.
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False
    )

    # Convert the prompt into tensors.
    inputs = tokenizer(
        [text],
        return_tensors="pt"
    ).to(model.device)

    # Generate the model response.
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False
        )

    # The generated sequence contains both:
    #
    #   original prompt + generated response
    #
    # We only want the newly generated tokens.
    generated_tokens = outputs[0][inputs.input_ids.shape[-1]:]

    # Convert tokens back into normal text.
    response = tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True
    )

    return response.strip()