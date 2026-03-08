# GlassPane

Glasspane is an attempt to bridge the gap between your data, knowledge and LLM based inference, all in a local first, privacy first manner.

It aims to be a simple and easy tool to:
- Store or connect to your data locally
- Reason and infer from that knowledge using LLMs (local or remote)
- Enable a single "glasspane" to see all your data
- Allow backup capabilities if needed

I am building this tool as a personal project and also to learn a bit more about LLMs, inference and data management for RAG.

## Tech Stack

The project is built using Kotling and Spring Boot, using as much of the native spring stack as possible for everything.

Local LLM inference is done via Ollama. Vector embeddings are done via pgVector.
