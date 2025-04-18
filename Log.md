# Development Log

## April 16, 2025

Right after getting the idea, there're a few things I want to test to validate the idea might work.
I'll use OpenAI playground to draft a simple prompt that might extract action items from log entries (using my personal log as example).
If the results are promising, I will start crafting the UI searching a WYSIWYG web editor with react support and build a quick and dirty todo list "sidebar".

TODO: Post draft from my whiteboard.

Results:

I have used the following prompt with GPT 4.1: 

```You are a personal assistant.
The provided text belongs to the personal blog from the author.
From the text, extract actions items.
Text that follows "TODO" has to be converted as well.
Return the action items in a json array. eg. ["Validate idea", "post draft from my whiteboard"]```

Using the above entry as example I got the following response:

```[
  "Test idea to validate it might work",
  "Use OpenAI playground to draft a simple prompt for extracting action items from log entries",
  "Use personal log as example for prompt",
  "If results are promising, start crafting the UI",
  "Search for a WYSIWYG web editor with React support",
  "Build a quick and dirty todo list sidebar",
  "Post draft from my whiteboard"
]```

I know the prompt can certainly be better and maybe shorter, but the result is quite good.
Although I don't have a lot of expectations I'll run the same prompt on a local Llama3 using Ollama.

The result is actually really good, while it didn't follow the exact format I've asked I know this can be improved:

```
[
  {
    "actionItem": "Validate idea"
  },
  {
    "actionItem": "Use OpenAI playground to draft a simple prompt that might extract action items from log entries 
(using my personal log as example)"
  },
  {
    "actionItem": "Start crafting the UI, searching for a WYSIWYG web editor with React support"
  },
  {
    "actionItem": "Build a quick and dirty todo list 'sidebar'"
  },
  {
    "actionItem": "Post draft from my whiteboard"
  }
]
```
The good news is that I can save a few bucks, at least during development (I assume the results might not be as good as the logs entries grow).

WYSIWYG Editor. via Google I've found the following options:

- https://jpuri.github.io/react-draft-wysiwyg/#/
- https://megahertz.github.io/react-simple-wysiwyg/
- https://www.tiny.cloud/solutions/wysiwyg-react-rich-text-editor/
- list https://github.com/JiHong88/awesome-wysiwyg?tab=readme-ov-file#for-react

On a second though, using a markdown editor will be a better idea: https://uiwjs.github.io/react-md-editor/
