export const SAMPLE_TRANSFORMER_NOTE = {
    _id: 'default-lm-head-transformer',
    title: 'How does the Language Model Head work in a Transformer?',
    tag: 'ai/ml',
    published_at: new Date().toISOString(),
    slug: 'how-does-the-language-model-head-work-in-a-transformer',
    content: `# How does the Language Model Head work in a Transformer?

Let's understand this deeply, using actual vectors, matrices, and numerical calculations, just as we have been doing with Transformer internals.

The Language Model Head (lm_head) is the part of a language model that converts the final representation of a token into scores for possible next tokens.

Imagine your decoder-only Transformer has processed this sentence:
> **The weather is cold**

After passing through token embeddings, positional information, masked self-attention, feed-forward networks, and multiple Transformer blocks, the model has a contextual representation of the word cold.

But there is one problem: a vector representing cold is not itself a prediction of the next word.

The model still needs to answer:
- Should the next token be **today**?
- Should it be **outside**?
- Should it be **because**?
- Should it be a punctuation mark?
- Should it be some other token in its vocabulary?

That is where the Language Model Head comes in.

### Transformer blocks
Attention, feed-forward networks, residual connections, normalization

### Final hidden vector
A contextual numerical representation of the current position:
\\(\\mathbf{h}\\in\\mathbb{R}^{D}\\)

### Language Model Head
\\(\\mathbf{z}=\\mathbf{h}W_{\\text{vocab}}+\\mathbf{b}\\)
Projects the hidden vector into vocabulary-sized scores called logits.

### Softmax
Converts scores into a probability distribution.

### Next-token prediction
Example: today 60%, outside 25%, because 10%, other tokens 5%

---

We'll work through the process in six stages, from a tiny vocabulary and a three-dimensional vector to how a real GPT model performs next-token prediction.

## Part 1 — What does the Transformer give to the Language Model Head?
First, let's distinguish three things that are easy to confuse:
1. **Token embedding:** the initial vector associated with a token.
2. **Final hidden state:** the representation produced after the token has passed through the Transformer.
3. **Logits:** scores produced by the Language Model Head for possible output tokens.

Suppose the input is:
> The weather is cold

For our example, we'll use a tiny model with a hidden dimension of \\(D=3\\). This is purely for learning; actual models generally use much larger dimensions.

Imagine the Transformer produces this final hidden vector at the position of cold:
\\[
\\mathbf h_{\\text{cold}}=
\\begin{bmatrix}
0.8 & 0.2 & 0.5
\\end{bmatrix}
\\]

This vector has three numbers.

What do they mean?

We might informally imagine that the numbers encode information about the context, such as:
- the topic of the sentence;
- relationships between words;
- information useful for predicting what comes next.

However, we should not assume that the first number literally means "weather," the second means "temperature," or the third means "grammar." Neural networks learn distributed representations, and individual dimensions don't usually have such simple meanings.

The important point is that the Transformer has processed the context and produced a vector that is useful for predicting the next token.

The Language Model Head takes this vector and translates it into vocabulary scores.

One more important detail: in a causal language model, the vector at the position of cold can use information from The weather is cold, but not from tokens that occur after cold. This is how the causal attention mask preserves autoregressive prediction.

## Part 2 — How does the Language Model Head transform a vector into scores?
Let's build our own miniature vocabulary:

Token\tMeaning
today\tA possible continuation
outside\tA possible continuation
because\tA possible continuation
warm\tA possible continuation
.\tEnd of the sentence

Our vocabulary contains only five tokens, so the Language Model Head needs to produce five scores.

Our hidden vector is:
\\[
\\mathbf h=
\\begin{bmatrix}0.8&0.2&0.5\\end{bmatrix}
\\]

The head uses a learned weight matrix. For this example, we will place one weight vector for each candidate token in a matrix whose columns correspond to vocabulary tokens.
\\[
W_{\\text{vocab}}=
\\begin{bmatrix}
1&0.5&0&-0.5&0\\\\
0&0.5&1&0&0\\\\
1&0&1&1&-0.5
\\end{bmatrix}
\\]

Notice the dimensions:
\\[
\\underbrace{\\mathbf h}_{1\\times3}
\\quad
\\underbrace{W_{\\text{vocab}}}_{3\\times5}
\\]

Matrix multiplication gives:
\\[
\\underbrace{\\mathbf z}_{1\\times5}
=
\\underbrace{\\mathbf h}_{1\\times3}
\\underbrace{W_{\\text{vocab}}}_{3\\times5}
\\]

The result has five numbers because there are five candidate tokens.

Let's calculate each score individually.

### Example A: Calculate the score for today
The column of weights associated with today is:
\\[
\\mathbf w_{\\text{today}}=
\\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix}
\\]

The score is the dot product between the hidden vector and this token's weight vector:
\\[
\\begin{aligned}
z_{\\text{today}}
&=\\mathbf h\\cdot\\mathbf w_{\\text{today}}\\\\
&=(0.8)(1)+(0.2)(0)+(0.5)(1)\\\\
&=0.8+0+0.5\\\\
&=1.3
\\end{aligned}
\\]

The score for today is \\(1.3\\).

### Example B: Calculate the score for outside
Its weight vector is:
\\[
\\mathbf w_{\\text{outside}}=
\\begin{bmatrix}0.5\\\\0.5\\\\0\\end{bmatrix}
\\]

Therefore:
\\[
\\begin{aligned}
z_{\\text{outside}}
&=(0.8)(0.5)+(0.2)(0.5)+(0.5)(0)\\\\
&=0.4+0.1+0\\\\
&=0.5
\\end{aligned}
\\]

### Example C: Calculate the score for because
\\[
\\mathbf w_{\\text{because}}=
\\begin{bmatrix}0\\\\1\\\\1\\end{bmatrix}
\\]

\\[
\\begin{aligned}
z_{\\text{because}}
&=(0.8)(0)+(0.2)(1)+(0.5)(1)\\\\
&=0+0.2+0.5\\\\
&=0.7
\\end{aligned}
\\]

We do the same multiplication for the remaining tokens.

The complete result is:
\\[
\\mathbf z=
\\begin{bmatrix}
1.3&0.5&0.7&0.1&-0.25
\\end{bmatrix}
\\]

### Explore the logits
These are the raw scores before softmax:
- **today:** 1.30
- **outside:** 0.50
- **because:** 0.70
- **warm:** 0.10
- **.:** -0.25

Here's the key idea:

Each candidate token has its own learned weight vector. The head compares the final hidden vector against each candidate's weights using a dot product.

A higher score means that the current representation aligns more strongly with that token's learned scoring direction. It does not yet mean that the token has that percentage chance of being selected.

The weights shown here are invented to make the calculations easy. In a trained language model, the weights are learned from data.

## Part 3 — Why do we need softmax after the Language Model Head?
Our logits are:
\\[
\\mathbf z=
\\begin{bmatrix}1.3&0.5&0.7&0.1&-0.25\\end{bmatrix}
\\]

These numbers are not probabilities.

For example, the score for today is \\(1.3\\). That does not mean there is a 130% chance that the next token is today.

To convert the logits into probabilities, we apply the softmax function:
\\[
P_i=\\frac{e^{z_i}}{\\sum_j e^{z_j}}
\\]

Let's calculate it.

#### Step 1: Apply the exponential function
\\[
e^{1.3}\\approx3.669
\\]
\\[
e^{0.5}\\approx1.649
\\]
\\[
e^{0.7}\\approx2.014
\\]
\\[
e^{0.1}\\approx1.105
\\]
\\[
e^{-0.25}\\approx0.779
\\]

#### Step 2: Add the exponential values
\\[
S=3.669+1.649+2.014+1.105+0.779
\\]
\\[
S\\approx9.216
\\]

#### Step 3: Divide each value by the sum
- For today:
\\[
P(\\text{today})=\\frac{3.669}{9.216}\\approx39.8\\%
\\]
- For outside:
\\[
P(\\text{outside})=\\frac{1.649}{9.216}\\approx17.9\\%
\\]
- For because:
\\[
P(\\text{because})=\\frac{2.014}{9.216}\\approx21.9\\%
\\]
- For warm:
\\[
P(\\text{warm})\\approx12.0\\%
\\]
- For .:
\\[
P(\\text{.})\\approx8.5\\%
\\]

The probabilities add up to approximately 100%, allowing for rounding.

### Final next-token probabilities
- **today:** 39.8%
- **outside:** 17.9%
- **because:** 21.9%
- **warm:** 12.0%
- **.:** 8.5%

These probabilities are illustrative, not a real model's prediction for the sentence.

### What does the model do with these probabilities?
There are two important possibilities:
- **Greedy decoding:** choose the token with the highest probability. In this example, that is today.
- **Sampling:** randomly select a token according to the probability distribution. outside could be selected even though its probability is lower.

Real generation can also use temperature, top-k, top-p, and other decoding strategies.

One distinction matters here: the Language Model Head produces logits; softmax turns those logits into probabilities. The head itself does not have to perform softmax.

## Part 4 — Why does the Language Model Head need so many weights?
So far, our model has only five possible output tokens and a hidden dimension of three. Real language models have much larger vocabularies and hidden dimensions.

Let's compare:

Model example\tHidden dimension \\(D\\)\tVocabulary size \\(V\\)\tHead weight parameters
Our tiny example\t3\t5\t15
Small illustrative model\t256\t32,000\t8.19 million
GPT-style illustrative model\t2,048\t128,000\t262.14 million

The head's parameter count is:
\\[
D\times V
\\]

For example, with \\(D=2048\\) and \\(V=128000\\):
\\[
2048\\times128000=262,144,000
\\]

That is about 262 million weight parameters, excluding the optional bias.

This explains why the vocabulary projection can be a substantial part of a model's parameters.

### What does the weight matrix look like?
For a hidden dimension of 4 and a vocabulary of 6, we might have:
\\[
\\mathbf h=
\\begin{bmatrix}0.2&0.7&-0.1&0.5\\end{bmatrix}
\\]
and
\\[
W_{\\text{vocab}}=
\\begin{bmatrix}
w_{11}&w_{12}&\\cdots&w_{16}\\\\
w_{21}&w_{22}&\\cdots&w_{26}\\\\
w_{31}&w_{32}&\\cdots&w_{36}\\\\
w_{41}&w_{42}&\\cdots&w_{46}
\\end{bmatrix}
\\]

Each column corresponds to one candidate token. Each row corresponds to one hidden-vector dimension.

The model computes:
\\[
z_j=\\sum_{i=1}^{D}h_iw_{ij}
\\]

In plain English:
1. Take the first hidden-vector value and multiply it by the corresponding weight for a candidate token.
2. Repeat for every dimension.
3. Add the products together.
4. Repeat for every token in the vocabulary.

The result is one score per token.

The matrix does not need to store a separate complete neural network for every token. A single matrix multiplication calculates all the scores efficiently.

### What happens when the input contains multiple tokens?
Suppose the input is:
> The weather is cold

The Transformer produces a hidden vector for each position. If the hidden dimension is 3, the final hidden-state matrix could have the following shape:
\\[
H\\in\\mathbb R^{4\\times3}
\\]

For illustration:
\\[
H=
\\begin{bmatrix}
h_{11}&h_{12}&h_{13}\\\\
h_{21}&h_{22}&h_{23}\\\\
h_{31}&h_{32}&h_{33}\\\\
h_{41}&h_{42}&h_{43}
\\end{bmatrix}
\\]

The Language Model Head projects every row, not just the final row:
\\[
Z=HW_{\\text{vocab}}
\\]

The dimensions are:
\\[
(4\\times3)(3\\times5)=(4\\times5)
\\]

Therefore, the head produces four sets of five logits.

During training, each position's prediction can be compared with the actual next token. For example:

Input position\tTarget next token
The\tweather
weather\tis
is\tcold
cold\tThe next token after cold

The last target depends on how the training sequence continues. The important idea is that each position predicts its next token, rather than predicting itself.

During generation, if the model receives The weather is cold, we typically use the logits from the final position to choose the next token.

## Part 5 — How does the Language Model Head learn its weights?
This is where the head connects to backpropagation and gradient descent.

At the beginning of training, its weights are generally initialized rather than already knowing which continuations make sense. Training teaches the model how to produce useful scores.

Suppose the correct next token is today.

Our example produced these logits:
\\[
\\mathbf z=
\\begin{bmatrix}
1.3&0.5&0.7&0.1&-0.25
\\end{bmatrix}
\\]

Softmax gave approximately:
\\[
\\mathbf p=
\\begin{bmatrix}
0.398&0.179&0.219&0.120&0.085
\\end{bmatrix}
\\]

The model assigned today a probability of only \\(0.398\\), even though it was the correct answer in this hypothetical training example.

We can calculate the cross-entropy loss:
\\[
\\mathcal L=-\\log P(\\text{correct token})
\\]

Therefore:
\\[
\\begin{aligned}
\\mathcal L&=-\\log(0.398)\\\\
&\\approx 0.921
\\end{aligned}
\\]

A lower loss means the model assigns a higher probability to the correct token.

### How does backpropagation update the head?
For a single training position, the gradient of the loss with respect to each logit is:
\\[
\\frac{\\partial\\mathcal L}{\\partial z_j}
=p_j-y_j
\\]

Here, \\(y_j=1\\) for the correct token and \\(0\\) for every other token.

Because today is the correct token:
\\[
\\frac{\\partial\\mathcal L}{\\partial\\mathbf z}
=
\\begin{bmatrix}
-0.602&0.179&0.219&0.120&0.085
\\end{bmatrix}
\\]

**Interpretation:**
- The negative gradient for today indicates that increasing its logit, with the other logits held fixed, would reduce the loss.
- The positive gradients for the incorrect candidates indicate that decreasing their logits, with the others held fixed, would reduce the loss.

These gradients are then propagated through the head into the Transformer:
\\[
\\frac{\\partial\\mathcal L}{\\partial W_{\\text{vocab}}}
=\\mathbf h^{T}
\\frac{\\partial\\mathcal L}{\\partial\\mathbf z}
\\]
and
\\[
\\frac{\\partial\\mathcal L}{\\partial\\mathbf h}
=
\\frac{\\partial\\mathcal L}{\\partial\\mathbf z}
W_{\\text{vocab}}^{T}
\\]

Notice what this means:
1. The gradient updates the Language Model Head's weights.
2. The gradient also flows backward into the final hidden vector.
3. That gradient continues backward through the Transformer blocks, including their attention and feed-forward operations.
4. Gradient descent or another optimizer updates the model's parameters.

This is the same gradient-flow principle you learned with micrograd: the loss tells the network how its output should change, and the chain rule propagates that information backward.

## Part 6 — How does this relate to GPT and the actual lm_head code?
Let's connect everything to PyTorch.

A simplified GPT-style model might contain:
\`\`\`python
self.lm_head = nn.Linear(n_embd, vocab_size, bias=False)
\`\`\`

Suppose:
\`\`\`python
n_embd = 3
vocab_size = 5
\`\`\`

The head's weight tensor has shape:
\`(5, 3)\`

Why is that different from our earlier \\(3\\times5\\) matrix?

Because PyTorch's \`nn.Linear\` stores its weight matrix in the orientation:
\\[
W_{\\text{PyTorch}}\\in\\mathbb R^{V\\times D}
\\]
and calculates:
\\[
Z=HW_{\scriptscriptstyle\text{PyTorch}}^T
\\]

The transpose turns the \\(5\\times3\\) stored weight matrix into a \\(3\\times5\\) matrix for multiplication.

Here is a tiny runnable example:
\`\`\`python
import torch
import torch.nn as nn

# A tiny vocabulary of 5 tokens
vocab_size = 5
n_embd = 3
lm_head = nn.Linear(n_embd, vocab_size, bias=False)

# Final hidden vector at the current position
h = torch.tensor([[0.8, 0.2, 0.5]])

# Convert the hidden vector into vocabulary logits
logits = lm_head(h)

# Convert logits into probabilities
probs = torch.softmax(logits, dim=-1)
tokens = ["today", "outside", "because", "warm", "."]

print("Hidden vector shape:", h.shape)
print("Head weight shape:", lm_head.weight.shape)
print("Logits shape:", logits.shape)
print("Logits:", logits)
print("Probabilities:", probs)
predicted_id = probs.argmax(dim=-1).item()
print("Most likely token:", tokens[predicted_id])
\`\`\`

### What does this look like in a real GPT forward pass?
A simplified version of the flow is:
\`\`\`python
# idx contains token IDs: (batch_size, sequence_length)
x = token_embedding(idx) + positional_embedding
x = transformer_blocks(x)
x = final_layer_norm(x)
logits = lm_head(x)
\`\`\`

If \`idx\` has shape \\((B,T)\\) where \\(B\\) is batch size and \\(T\\) is sequence length, then:
\\[
x\\in\\mathbb R^{B\\times T\\times D}
\\]
and the head produces:
\\[
Z\in\mathbb R^{B\times T\times V}
\\]

The single most important equation to remember is:
\\[
\\text{Logits}
=
\\text{Final hidden states}
\\times
\\text{Vocabulary projection weights}
\\]
`
}
