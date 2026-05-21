# Contract: Provider Token Stream

```js
for await (const chunk of streamProviderText(config)) {
  // chunk: { type: 'token', text: '...', providerId: 'openai', model: 'gpt-4.1' }
}
```

Supported adapters in this slice:

- `openai-responses`
- `anthropic-messages`
