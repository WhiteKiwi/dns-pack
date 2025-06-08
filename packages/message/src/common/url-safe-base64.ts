/**
 * https://datatracker.ietf.org/doc/html/rfc4648#section-5
 */
export const UrlSafeBase64 = {
  encode: (buffer: Buffer): string => {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
};
