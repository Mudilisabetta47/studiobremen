/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string; email: string; newEmail: string; confirmationUrl: string
}

export const EmailChangeEmail = ({
  email, newEmail, confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>E-Mail-Änderung bestätigen · BOLM Apartments</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>BOLM APARTMENTS</Text>
          <Text style={tagline}>Ihr Zuhause in Bremen</Text>
        </Section>
        <Section style={content}>
          <Heading style={h1}>E-Mail-Änderung bestätigen</Heading>
          <Text style={text}>
            Sie haben eine Änderung Ihrer E-Mail-Adresse bei BOLM Apartments angefordert —
            von <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
            zu <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
          </Text>
          <Text style={text}>
            Klicken Sie auf den Button unten, um die Änderung zu bestätigen:
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>Änderung bestätigen</Button>
          </Section>
          <Text style={footer}>
            Falls Sie diese Änderung nicht angefordert haben, sichern Sie Ihr Konto umgehend.
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

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '0' }
const header = { backgroundColor: '#14192b', padding: '32px 40px', textAlign: 'center' as const, borderTop: '4px solid #d19e37' }
const brand = { color: '#ffffff', fontSize: '20px', fontWeight: 'bold' as const, letterSpacing: '4px', margin: 0 }
const tagline = { color: '#d19e37', fontSize: '12px', fontStyle: 'italic' as const, letterSpacing: '1px', margin: '6px 0 0' }
const content = { padding: '40px' }
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, color: '#14192b', margin: '0 0 20px', letterSpacing: '-0.5px' }
const text = { fontSize: '15px', color: '#3d4255', lineHeight: '1.6', margin: '0 0 18px', fontFamily: 'Helvetica, Arial, sans-serif' }
const link = { color: '#d19e37', textDecoration: 'underline' }
const buttonWrap = { margin: '28px 0', textAlign: 'center' as const }
const button = {
  backgroundColor: '#14192b', color: '#ffffff', fontSize: '14px', fontWeight: 'bold' as const,
  letterSpacing: '1px', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none',
  textTransform: 'uppercase' as const, fontFamily: 'Helvetica, Arial, sans-serif', border: '1px solid #d19e37',
}
const footer = { fontSize: '13px', color: '#8a8a8a', margin: '28px 0 0', fontFamily: 'Helvetica, Arial, sans-serif' }
const brandFooter = { padding: '20px 40px', borderTop: '1px solid #ebe8e0', textAlign: 'center' as const }
const brandFooterText = { fontSize: '11px', color: '#8a8a8a', letterSpacing: '1px', margin: 0, fontFamily: 'Helvetica, Arial, sans-serif' }
const brandFooterLink = { color: '#d19e37', textDecoration: 'none' }
