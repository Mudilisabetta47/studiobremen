/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps { token: string }

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Ihr Bestätigungscode · BOLM Apartments</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>BOLM APARTMENTS</Text>
          <Text style={tagline}>Ihr Zuhause in Bremen</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Identität bestätigen</Heading>
          <Text style={text}>
            Verwenden Sie den Code unten, um Ihre Identität zu bestätigen:
          </Text>
          <Section style={codeWrap}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={footer}>
            Dieser Code läuft in Kürze ab. Falls Sie dies nicht angefordert haben,
            ignorieren Sie diese E-Mail.
          </Text>
        </Section>
        <Section style={brandFooter}>
          <Text style={brandFooterText}>
            BOLM Apartments · Bremen · <Link href="https://bolm-apartments.de" style={brandFooterLink}>bolm-apartments.de</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0' }
const header = { backgroundColor: '#14192b', padding: '32px 40px', textAlign: 'center' as const, borderTop: '4px solid #d19e37' }
const brand = { color: '#ffffff', fontSize: '20px', fontWeight: 'bold' as const, letterSpacing: '4px', margin: 0 }
const tagline = { color: '#d19e37', fontSize: '12px', fontStyle: 'italic' as const, letterSpacing: '1px', margin: '6px 0 0' }
const content = { padding: '40px' }
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, color: '#14192b', margin: '0 0 20px', letterSpacing: '-0.5px' }
const text = { fontSize: '15px', color: '#3d4255', lineHeight: '1.6', margin: '0 0 18px', fontFamily: 'Helvetica, Arial, sans-serif' }
const codeWrap = { textAlign: 'center' as const, margin: '28px 0', padding: '20px', backgroundColor: '#f7f5ef', border: '1px solid #ebe8e0' }
const codeStyle = {
  fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const,
  color: '#14192b', letterSpacing: '6px', margin: 0,
}
const footer = { fontSize: '13px', color: '#8a8a8a', margin: '28px 0 0', fontFamily: 'Helvetica, Arial, sans-serif' }
const brandFooter = { padding: '20px 40px', borderTop: '1px solid #ebe8e0', textAlign: 'center' as const }
const brandFooterText = { fontSize: '11px', color: '#8a8a8a', letterSpacing: '1px', margin: 0, fontFamily: 'Helvetica, Arial, sans-serif' }
const brandFooterLink = { color: '#d19e37', textDecoration: 'none' }
