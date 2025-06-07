import { DnsMessage } from '../../message/message';
import { HexReadable } from './hex-readable';

export function dnsMessageToReadable({
  header,
  questions,
  answers,
  authorities,
  additional,
}: DnsMessage) {
  const headerStr = [
    `>> Header`,
    `  - ID: ${header.id}`,
    `  - FLAGS:`,
    `    - QR: ${header.flags.QR}`,
    `    - Opcode: ${header.flags.Opcode}`,
    `    - AA: ${header.flags.AA}`,
    `    - TC: ${header.flags.TC}`,
    `    - RD: ${header.flags.RD}`,
    `    - RA: ${header.flags.RA}`,
    `    - Z: ${header.flags.Z}`,
    `    - AD: ${header.flags.AD}`,
    `    - CD: ${header.flags.CD}`,
    `    - RCODE: ${header.flags.RCODE}`,
    `  - QDCOUNT: ${header.count.question}`,
    `  - ANCOUNT: ${header.count.answer}`,
    `  - NSCOUNT: ${header.count.authority}`,
    `  - ARCOUNT: ${header.count.additional}`,
  ].join('\n');

  const questionsStr = [
    `>> Questions`,
    ...questions.map(
      (question, i) =>
        `  - ${i + 1}. Name: ${question.name}, Type: ${question.type}, Class: ${question.class}`,
    ),
  ].join('\n');

  const answersStr = [
    `>> Answers`,
    ...answers.map((rr, i) => {
      const lines = HexReadable.fromBuffer(rr.data.serialize())
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const arr = [
        `  > ${i + 1}. Name: ${rr.name}`,
        `    - Type: ${rr.type}`,
        `    - Class: ${rr.class}`,
        `    - Ttl: ${rr.ttl}`,
      ];
      if (lines.length === 1) {
        arr.push(`    - Data: ${lines[0]}`);
      } else if (lines.length === 0) {
        arr.push(`    - Data: (no data)`);
      } else {
        arr.push(`    - Data: \n${lines.map((line) => `      ${line}`).join('\n')}`);
      }
      return arr.join('\n');
    }),
  ].join('\n');

  const authoritiesStr = [
    `>> Authorities`,
    ...authorities.map((rr, i) => {
      const lines = HexReadable.fromBuffer(rr.data.serialize())
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const arr = [
        `  > ${i + 1}. Name: ${rr.name}`,
        `    - Type: ${rr.type}`,
        `    - Class: ${rr.class}`,
        `    - Ttl: ${rr.ttl}`,
      ];
      if (lines.length === 1) {
        arr.push(`    - Data: ${lines[0]}`);
      } else if (lines.length === 0) {
        arr.push(`    - Data: (no data)`);
      } else {
        arr.push(`    - Data: \n${lines.map((line) => `      ${line}`).join('\n')}`);
      }
      return arr.join('\n');
    }),
  ].join('\n');

  const additionalStr = [
    `>> Additional`,
    ...additional.map((rr, i) => {
      const lines = HexReadable.fromBuffer(rr.data.serialize())
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const arr = [
        `  > ${i + 1}. Name: ${rr.name}`,
        `    - Type: ${rr.type}`,
        `    - Class: ${rr.class}`,
        `    - Ttl: ${rr.ttl}`,
      ];
      if (lines.length === 1) {
        arr.push(`    - Data: ${lines[0]}`);
      } else if (lines.length === 0) {
        arr.push(`    - Data: (no data)`);
      } else {
        arr.push(`    - Data: \n${lines.map((line) => `      ${line}`).join('\n')}`);
      }
      return arr.join('\n');
    }),
  ].join('\n');

  return [headerStr, questionsStr, answersStr, authoritiesStr, additionalStr].join('\n\n');
}
