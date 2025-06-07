# @dns-pack/message

```typescript
const message = DnsMessage.query(
  1234, // ID
  {
    QR: 'query',
    Opcode: Header.Flags.Opcode.QUERY,
    AA: false,
    TC: false,
    RD: false,
    RA: false,
    RCODE: 0,
  },
  {
    questions: [new Question('example.com.', DnsType.A, DnsClass.IN)],
    additional: [
      new ResourceRecord.OPT(
        0, // version
        [], // options
        0, // extended rcode
        { DO: true }, // flags
        512, // requestor's udp payload size
      ),
    ],
  },
);

// BNIAAAABAAAAAAABB2V4YW1wbGUDY29tAAABAAEAACkCAAAAgAAAAA==
console.log(message.serialize().toString('base64'));
```
