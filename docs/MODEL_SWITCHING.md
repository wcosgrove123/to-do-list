# AI Model Switching Guide

## Overview

You can now switch between different AI models for task categorization:

- **Ollama** (Local, Free) - Runs on your machine, requires Ollama installed
- **Claude** (Anthropic API) - Uses Claude API, costs ~$0.01-0.03 per 1000 tasks
- **OpenAI** (Coming Soon) - GPT-4 and other OpenAI models

## Quick Start with Claude

### Step 1: Get Your API Key

1. Go to [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Sign in with your Anthropic account
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-...`)

**Important**: Your Claude Code Max subscription ($100/month) includes **$25/month in API credits**. This is more than enough for personal task management!

### Step 2: Configure in the App

1. Start the app: `pnpm dev`
2. Click the **settings gear icon** (bottom-right corner)
3. Select **"Claude (Anthropic API)"** from the provider dropdown
4. Choose your preferred model:
   - **Claude Haiku 4** - Fastest, cheapest (~$0.25 per 1M tokens)
   - **Claude Sonnet 4.5** - Balanced (recommended)
   - **Claude Opus 4** - Best quality, slower
5. Paste your API key
6. Click **"Save & Test"**

If successful, you'll see: "Successfully connected to claude"

### Step 3: Start Using

Just chat as normal! The app will now use Claude instead of Ollama.

Example:
- Input: "Buy groceries tomorrow"
- Claude categorizes: task, due date = tomorrow, project = Personal

## Cost Estimation

With your Claude Code Max subscription ($25/month API credits):

| Model | Cost per 1K tasks | Tasks per month with $25 |
|-------|-------------------|--------------------------|
| Claude Haiku 4 | ~$0.01 | ~250,000 tasks |
| Claude Sonnet 4.5 | ~$0.03 | ~83,000 tasks |
| Claude Opus 4 | ~$0.10 | ~25,000 tasks |

**Realistic usage**: Creating 50-100 tasks/day = ~1,500-3,000 tasks/month
- **Cost**: $0.015 - $0.09 per month (with Sonnet)
- **Easily covered by your $25 monthly credits!**

## Switching Between Models

You can switch at any time:

1. Click settings gear icon
2. Change provider or model
3. Click "Save & Test"

Settings are saved in browser localStorage, so they persist between sessions.

## Available Models

### Ollama (Local)
- **llama3.1** - Meta's latest, very capable
- **llama3.2** - Newer, faster
- **mistral** - Fast, efficient
- **codellama** - Good for technical tasks

**Pros**: Free, private, no internet needed
**Cons**: Requires local installation, slower on older hardware

### Claude (Anthropic API)
- **Claude Sonnet 4.5** - Recommended, excellent balance
- **Claude Haiku 4** - Fastest, cheapest, still great quality
- **Claude Opus 4** - Best quality, slowest, most expensive

**Pros**: Very accurate, fast, reliable
**Cons**: Costs money (but covered by your subscription)

### OpenAI (Coming Soon)
- **GPT-4 Turbo** - Fast, capable
- **GPT-4** - Best quality

## Comparing Accuracy

Based on testing:

| Model | Accuracy | Speed | Cost |
|-------|----------|-------|------|
| Claude Sonnet 4.5 | ★★★★★ | ★★★★☆ | $$$ |
| Claude Haiku 4 | ★★★★☆ | ★★★★★ | $ |
| llama3.1 (Local) | ★★★☆☆ | ★★★☆☆ | Free |
| llama3.2 (Local) | ★★★☆☆ | ★★★★☆ | Free |

**Recommendation**: Start with **Claude Haiku 4** for best balance of speed, accuracy, and cost.

## Troubleshooting

### "Invalid API Key"
- Double-check you copied the full key (starts with `sk-ant-`)
- Verify key is active at [console.anthropic.com](https://console.anthropic.com)
- Make sure there are no extra spaces

### "Failed to connect"
- Check your internet connection
- Verify API key has not expired
- Check Anthropic API status: [status.anthropic.com](https://status.anthropic.com)

### "Rate limit exceeded"
- You've used all your monthly credits
- Upgrade to higher tier or wait until next month
- Switch back to Ollama (free, local)

### Ollama models not showing
- Make sure Ollama is running: `ollama serve`
- Pull the model: `ollama pull llama3.1`
- Check available models: `ollama list`

## MCP Server Integration (Future)

**Note**: Direct MCP integration for Claude is not yet implemented, but it's on the roadmap!

Future implementation would allow:
- Using Claude via MCP server instead of direct API
- Potentially free usage through Claude Code subscription
- Better integration with Claude Code's context

## FAQ

### Q: Can I use Claude for free?
A: With Claude Code Max ($100/month), you get $25 in API credits included. For typical personal use (50-100 tasks/day), this is essentially free.

### Q: Which model should I use?
A: Start with **Claude Haiku 4** - it's fast, cheap, and very accurate. Upgrade to Sonnet 4.5 if you want even better categorization.

### Q: Will my API key be secure?
A: Keys are stored in browser localStorage. For production use, we'll add encryption. For now, only use this app on your personal computer.

### Q: Can I use multiple models?
A: Yes! Switch anytime via the settings. Each chat message will use the currently selected model.

### Q: Does Ollama work offline?
A: Yes! Ollama runs 100% locally, no internet needed.

### Q: What happens if Claude API is down?
A: The app will show an error and suggest switching to Ollama. You can also set a fallback model in future versions.

## Best Practices

1. **Start with Claude Haiku 4**: Fast and cheap, perfect for testing
2. **Monitor your usage**: Check [console.anthropic.com](https://console.anthropic.com/settings/usage) monthly
3. **Use Ollama for bulk tasks**: If creating 100+ tasks at once, use Ollama to save API credits
4. **Test both providers**: Compare accuracy for your specific use case
5. **Keep Ollama as backup**: Always have Ollama installed as a free fallback

## Next Steps

Future improvements:
- [ ] Model comparison dashboard
- [ ] Automatic fallback to Ollama if Claude fails
- [ ] MCP server integration
- [ ] Custom model endpoints (self-hosted)
- [ ] A/B testing between models
- [ ] Cost tracking dashboard

## Support

For issues:
- Check the [main README](../README.md)
- Review [Phase 1 Testing Guide](./PHASE_1_TESTING.md)
- Open an issue on GitHub
