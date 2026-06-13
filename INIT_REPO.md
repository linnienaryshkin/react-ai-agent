# Anthropic Architect Learning Curriculum

I wanna create a learning curriculum for my teammates to learn LLM based systems, agents, and specifically Anthropic's API. To then obtain Anthropic Architect certification.

---

Here are main domains required to learn:

- Domain 1: Agentic Architecture & Orchestration

Design and implement agentic systems using Claude's Agent SDK. Covers agentic loops, multi-agent orchestration, hooks, workflows, session management, and task decomposition patterns for production-grade AI applications.

- Domain 2: Tool Design & MCP Integration

Design effective tools and integrate with Model Context Protocol (MCP) servers. Covers tool description best practices, structured error responses, tool distribution, MCP configuration, and Claude's built-in tools.

- Domain 4: Prompt Engineering & Structured Output

Master prompt engineering techniques for production systems. Covers explicit criteria, few-shot prompting, tool_use for structured output, JSON schema design, validation-retry loops, and multi-pass review strategies.

- Domain 5: Context Management & Reliability

Manage context effectively in production systems. Covers progressive summarization risks, context positioning, escalation patterns, error propagation, context degradation, human review, and information provenance.

> Domain 3 is related to the LLM code assistants, which is out of scope for this curriculum as it focuses on agentic systems and tool integration rather than code generation.

---

Our auditory is Frontend engineers, with the stack of typescript and react. So, there is a bit of chellendge for them to get a grasp of how exactly LLMs work to organize. So, I wanna give a common infrastructure for them, to still have an access to the Anthropic API and learn how to use it, without the need to create a backend for it.

The learning path is mainly focused on the <https://github.com/anthropics/anthropic-sdk-typescript> usage.

So, how I see it: we have a very simple react application, chat UI, .env file with the Anthropic Key, and multiple tasks to deal with.

Nothing fancy, just a lint, prettier, google material, and bare minimum for the application to run and look valid.

---

We start with kata number 1. And just have a potential plan for other katas. How many of them is question, and we don't need to have answer on it right now. And especially implementation. Let's start with a meaningful first kata and see than.

---

Structurally, each kata lives in a separate folder, with a README, prepared and runnable ts files, ideally it's one file with code, and another file nearby with a completed task.

---

Completed first kata is: a workable chat, with initd Anthropic client, context management, ability to start new chat, create human message, separate ability to turn one streaming messages, ask for a structured output, and prompt endangering with testing.

---

Ideally, I want to have some sort of domain in which this chat is happening. But for now let's focus on functionality, build a whole curriculum roadmap, and then think how could we make it less clinical and more fun.

---

Separate file for Anthropic API Key obtaining. With step by step instructions. Just mock this file and reference it in README.

---

Useful resources:

- Exam Guide: <https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773274827%2FClaude+Certified+Architect+%E2%80%93+Foundations+Certification+Exam+Guide.pdf>
- <https://claudecertifications.com/claude-certified-architect/exam-guide>
- <https://claudecertificationguide.com/>
- <https://www.certsafari.com/anthropic/claude-certified-architect>
