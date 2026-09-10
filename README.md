# Akssora Search

**Akssora** is a multimodal media search engine for searching inside videos using **visual embeddings and transcripts**.

The goal is to make searching through video feel like `grep` for media - find _what_ you're looking for and _where_ it happens.

## Development

### **Prequisites**

ffmpeg is required to process videos.

[https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)

Install dependencies:

```bash
make install
```

Build the engine:

```bash
make build
```

Run the demo:

```bash
make run
```

### Performance

| Video Size | Duration of Video | Time to Process        |
| ---------- | ----------------- | ---------------------- |
| 83M        | 23:12             | 5 minutes 49.8 seconds |
| 19M        | 3:05              | 1 minute 3.0 seconds   |

### Limitations

- Limited to English language.
- Video Size < 100MB is recommended for testing.
- Longer duration videos are not supported yet.

> **Status:** Early development / MVP.
