# @dns-pack/message

```typescript
const message = DnsMessage.Query(
  1234, // ID
  Header.Flags.of({
    QR: 'query',
    OPCODE: 'QUERY',
    AA: false,
    TC: false,
    RD: false,
    RA: false,
    Z: false,
    AD: false,
    CD: false,
    RCODE: 0,
  }),
  {
    questions: [Question.of({ name: 'example.com.', type: 'A', class: 'IN' })],
    additional: [
      ResourceRecord.OPT.of({
        version: 0,
        flags: { DO: true },
        extendedRCode: 0,
        options: [],
        udpPayloadSize: 512,
      }),
    ],
  },
);

// BNIAAAABAAAAAAABB2V4YW1wbGUDY29tAAABAAEAACkCAAAAgAAAAA==
console.log(message.serialize().toString('base64'));
```
