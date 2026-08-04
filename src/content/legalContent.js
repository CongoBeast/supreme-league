export const COMPANY_NAME = 'Vista Novum Private Limited';
export const PLATFORM_NAME = 'Supreme Fantasy League';
export const LEGAL_VERSION = '1.0';
export const LEGAL_EFFECTIVE_DATE = '3 August 2026';

export const SECURITY_WARNING = `${PLATFORM_NAME} will never contact you by SMS, WhatsApp, email or telephone to ask you to send funds directly, disclose an OTP, password, wallet PIN, card PIN or CVC, or approve an unexpected payment request. Payments must be initiated by you through the official platform and an approved payment provider.`;

export const COMPETITION_RULES = [
  {
    heading: '1. Eligibility and one-account rule',
    paragraphs: [
      'Participation is limited to persons aged 18 years or older who provide accurate registration information and maintain one account only. Each FPL manager ID may be linked to one Supreme Fantasy League account. Management may require identity, age, ownership or payment verification before allowing entry, settlement or withdrawal.',
      'Accounts, entries or prizes may be suspended where information is false, duplicated, unauthorised, incomplete or reasonably suspected to be connected to abuse, collusion, fraud, chargebacks or manipulation.',
    ],
  },
  {
    heading: '2. Competition-specific terms take priority',
    paragraphs: [
      'Each league card or competition notice states the applicable entry price, access conditions, start and end gameweeks, joining deadline, late-entry policy, prize classification, minimum participation requirement and any special tie-break or settlement rule. Those published terms form part of these Rules and take priority where they are more specific.',
      'A prize is binding only when marked confirmed or guaranteed for that competition before entry. Projected, promotional, roadmap or participation-dependent amounts may change before confirmation.',
    ],
  },
  {
    heading: '3. Scoring source and corrections',
    paragraphs: [
      'Standings are calculated from the official FPL data source and the gameweeks identified for the competition. Supreme Fantasy League may refresh, correct or recalculate standings when the official source changes, corrects or delays data, or where a technical issue affected an earlier display.',
      'Displayed live scores and ranks are provisional until the competition enters final review and is marked settled. The final stored score version used at settlement controls the result.',
    ],
  },
  {
    heading: '4. Deadlines, late entry and subscriptions',
    paragraphs: [
      'Entry is subject to the joining deadline and successful payment or qualifying subscription status. A late entry is allowed only where the competition expressly permits it and may carry a reduced competitive opportunity because earlier gameweeks may not be counted or recoverable.',
      'For subscription competitions, eligibility is assessed at the published lock time. A subscription that expires before that time does not qualify. Where a valid subscription expires after the competition has locked, the participant may complete that competition but will not be enrolled into future periods unless renewed.',
    ],
  },
  {
    heading: '5. Fair play and prohibited conduct',
    paragraphs: [
      'Participants must not use duplicate accounts, another person’s FPL team, false identity information, unauthorised payment instruments, coordinated account activity, automated abuse, system interference, exploit attempts, chargeback abuse or any conduct intended to distort standings, eligibility, wallet balances or prize allocation.',
      'Management may investigate, request supporting evidence, freeze activity, disqualify an entry, reverse an improperly credited amount, suspend an account or refer suspected unlawful conduct to a provider or competent authority.',
    ],
  },
  {
    heading: '6. Ties and prize allocation',
    paragraphs: [
      'Unless a competition publishes a different tie-break before entry, participants with the same highest qualifying score share the prize equally. Integer-cent rounding is applied so that the total amount credited never exceeds the confirmed prize pool.',
      'A participant must remain eligible and in good standing through settlement. A prize may be withheld while identity, payment, account ownership, sanctions, chargeback or integrity checks are completed.',
    ],
  },
  {
    heading: '7. Review, disputes and management decisions',
    paragraphs: [
      'After the final gameweek, results may enter a review period. Any concern must be submitted through the official in-platform support channel with the relevant league, transaction or account reference. Management may consider official FPL data, payment-provider records, audit logs, timestamps and other reliable evidence.',
      'Management’s determination is final for operational matters such as eligibility, scoring implementation, deadlines, rule enforcement, cancellation, refund method and prize administration, subject always to applicable law and rights that cannot lawfully be excluded or waived.',
    ],
  },
  {
    heading: '8. Outages, irregularities and cancellation',
    paragraphs: [
      'Where an official data source, payment provider, communications network, cloud service or other dependency is delayed, unavailable, inaccurate or compromised, management may pause, extend, recalculate, reschedule, cancel, refund or otherwise adjust the affected competition in the fairest reasonably available manner.',
      'No participant is entitled to a speculative profit, consequential amount or compensation based on an interrupted display, provisional rank, failed personal device, missed notification or unavailable third-party service.',
    ],
  },
  {
    heading: '9. Payouts and withdrawals',
    paragraphs: [
      'Wallet credits remain subject to settlement, verification, reversals and account review. Withdrawals are available only through supported USD payout methods, are subject to the minimum shown in the wallet, and normally take three to four business days after approval, although provider or banking delays may extend that period.',
      'Users are responsible for accurate beneficiary information. Supreme Fantasy League is not responsible for delays or loss caused by incorrect account details supplied by the user, a beneficiary-bank rejection, provider downtime or a compliance hold outside the platform’s reasonable control.',
    ],
  },
];

export const TERMS_SECTIONS = [
  {
    heading: '1. Contracting parties and acceptance',
    paragraphs: [
      `These Terms govern use of ${PLATFORM_NAME}, a service operated by ${COMPANY_NAME} (“Vista Novum”, “we”, “us” or “our”). By creating an account, accepting these Terms, entering a competition, purchasing a subscription, funding or using a wallet, or continuing to use the service after an updated version takes effect, you enter into a binding agreement with ${COMPANY_NAME}.`,
      'You confirm that you have read and understood these Terms, the Privacy Policy and the Competition Rules. Electronic acceptance has the same effect as a written signature to the extent permitted by law.',
    ],
  },
  {
    heading: '2. Eligibility and authority',
    paragraphs: [
      'You must be at least 18 years old, legally capable of contracting, and permitted to use the service in your location. You must use your own identity, contact information, FPL manager ID and authorised payment method.',
      'If you act for another person or organisation, you warrant that you have authority to bind that person or organisation and remain responsible for all activity performed through the account.',
    ],
  },
  {
    heading: '3. Nature of the service',
    paragraphs: [
      'Supreme Fantasy League administers skill-based fantasy-football competitions using qualifying FPL performance. It is independent and is not affiliated with, endorsed by or operated by the Premier League or the official fantasy game.',
      'We do not promise that participation will produce a prize, profit or financial return. Past performance, FPL rank, prize examples and promotional roadmaps do not guarantee future outcomes.',
    ],
  },
  {
    heading: '4. Accounts and security',
    paragraphs: [
      'You are responsible for safeguarding your password, devices, email account, payment access and any authentication factor. You must notify management immediately through official support if you suspect unauthorised access or a fraudulent request.',
      SECURITY_WARNING,
      'We may restrict, suspend or close an account where necessary to protect users, funds, records, the platform or third parties, or to comply with a lawful request, provider requirement or integrity review.',
    ],
  },
  {
    heading: '5. Subscriptions, entries and payments',
    paragraphs: [
      'Prices and eligibility are determined by the authoritative backend record at checkout. A displayed balance, pending payment or provisional entry does not create an entitlement until the transaction is recorded as completed and all eligibility conditions are satisfied.',
      'Subscriptions provide access only to the competitions described for the plan and valid period. They do not guarantee entry where a deadline, capacity, verification, suspension or other published restriction applies.',
      'Payment-provider processing, exchange, network, banking, compliance or reversal decisions may be outside our control. We may delay activation, settlement or withdrawal until a payment is finally confirmed.',
    ],
  },
  {
    heading: '6. Referral programme',
    paragraphs: [
      'A member may receive the referral amount published by the platform when a genuinely new user registers with that member’s code and completes a first qualifying subscription or league-entry purchase of any amount. A registration by itself does not create a payable reward.',
      'Self-referrals, duplicate or related-account abuse, reversed or refunded purchases, unauthorised payments, fabricated identities and transactions created primarily to obtain a reward do not qualify. We may withhold, reverse or recover a referral credit where the qualifying transaction is reversed or the referral breaches these Terms.',
    ],
  },
  {
    heading: '7. Wallet records and withdrawals',
    paragraphs: [
      'The platform wallet is an internal accounting facility, not a bank account, deposit account, stored-value banking product or investment. It does not earn interest. Available and pending balances are determined by the platform ledger and may be corrected where reconciliation identifies an error, duplicate, reversal, chargeback or unauthorised credit.',
      'You must provide accurate USD beneficiary details. We may request verification and may reject, hold or reverse a withdrawal where information is incomplete, a transaction is disputed, an account is under review or a legal or provider requirement applies.',
    ],
  },
  {
    heading: '8. User responsibility and financial-risk acknowledgement',
    paragraphs: [
      'You decide whether to subscribe, enter a competition, maintain a wallet balance or request a withdrawal. You accept the risk that you may receive no prize and may lose entry fees, subscription fees, time or opportunity as a result of your own decisions, FPL performance, missed deadlines, inaccurate details, account compromise or circumstances outside our reasonable control.',
      'To the fullest extent permitted by law, Vista Novum is not responsible for financial loss arising from user error, unauthorised disclosure of credentials, incorrect beneficiary information, an unexpected payment prompt approved by the user, third-party outages, official-data corrections, force majeure, provider action, network failure, device failure, suspension for suspected abuse or failure to follow published rules.',
    ],
  },
  {
    heading: '9. Availability, accuracy and third-party services',
    paragraphs: [
      'We aim to provide reliable access but do not warrant uninterrupted, error-free or continuously available service. The platform depends on third parties including fantasy-data, email, hosting, cloud-storage, telecommunications, payment and banking providers.',
      'We may correct data, balances, standings, transactions or communications where an error is identified. A temporary display, notification or estimate does not override the authoritative ledger, official data source, competition record or final settlement.',
    ],
  },
  {
    heading: '10. Limitation of liability',
    paragraphs: [
      'Nothing in these Terms excludes liability that cannot lawfully be excluded, including liability arising from fraud, wilful misconduct or any other non-excludable obligation. Subject to that limitation, neither Vista Novum nor its directors, employees, contractors or service providers is liable for indirect, incidental, special, punitive or consequential loss; loss of opportunity, anticipated winnings, data, goodwill or business; or loss caused by a third-party service or event outside reasonable control.',
      'To the fullest extent permitted by law, the aggregate liability of Vista Novum arising from a specific claim is limited to the amount actually paid by the claimant to Supreme Fantasy League for the directly affected service during the six months preceding the event giving rise to the claim, or US$100, whichever is greater.',
    ],
  },
  {
    heading: '11. Indemnity',
    paragraphs: [
      'You agree to indemnify and hold Vista Novum harmless from third-party claims, losses, chargebacks, penalties, costs and reasonable legal expenses arising from your breach of these Terms, unlawful conduct, misuse of another person’s identity, FPL account or payment method, infringement of rights, false information, or interference with the platform.',
    ],
  },
  {
    heading: '12. Management review and dispute process',
    paragraphs: [
      'Before starting external proceedings, you must submit the dispute through official support and allow management a reasonable opportunity to investigate and respond. You must provide the account, league and transaction references and any relevant evidence.',
      'Operational determinations made under the Competition Rules are final subject to applicable law. If a legal dispute remains unresolved after internal review, it is governed by the laws of Zimbabwe and must be brought before a court of competent jurisdiction in Zimbabwe, unless the parties agree in writing to another lawful resolution process.',
      'Nothing in this clause removes a right or remedy that cannot lawfully be waived. Any purported waiver applies only to the fullest extent permitted by applicable law.',
    ],
  },
  {
    heading: '13. Suspension, termination and survival',
    paragraphs: [
      'We may suspend or terminate access, void an entry, withhold settlement or close an account for breach, security risk, payment dispute, suspected manipulation, legal requirement or material harm to the platform or another person. Where reasonably possible, we will provide an explanation through the account or registered email.',
      'Payment obligations, audit rights, intellectual-property provisions, liability limits, indemnities, dispute terms and any provision intended by its nature to survive remain effective after account closure.',
    ],
  },
  {
    heading: '14. Changes, severability and entire agreement',
    paragraphs: [
      'We may update these Terms for legal, security, operational or product reasons. Material changes will be communicated through the platform or registered email and may require renewed acceptance.',
      'If a provision is found invalid or unenforceable, it is limited or removed only to the minimum extent necessary and the remaining provisions continue in effect. These Terms, the Privacy Policy, Competition Rules and competition-specific terms form the entire agreement concerning the service.',
    ],
  },
];

export const PRIVACY_SECTIONS = [
  {
    heading: '1. Who controls your information',
    paragraphs: [
      `${COMPANY_NAME} controls the personal information processed through ${PLATFORM_NAME}. This Policy explains what we collect, why we use it, when it is shared, how long it is retained and the choices available to you.`,
    ],
  },
  {
    heading: '2. Information we collect',
    paragraphs: [
      'We may collect identity and contact details; age and location information; login and security records; FPL manager ID, team name, scores and ranks; profile images; subscription, league and eligibility records; wallet, payment, withdrawal and referral records; device, IP, audit and usage information; and support communications.',
      'We do not ask for or intentionally store your payment-provider password, card PIN, wallet PIN, OTP, full card number or CVC. Do not place those details in a profile, support ticket, league message or email.',
    ],
  },
  {
    heading: '3. How we use information',
    paragraphs: [
      'We use information to create and secure accounts; verify eligibility; link FPL data; administer leagues, standings, subscriptions, referrals, payments, wallets and withdrawals; prevent abuse; reconcile records; communicate transactional updates; provide support; comply with law; and improve service reliability.',
      'Marketing communication is separate from essential service communication and is sent only where permitted. You can withdraw optional marketing consent without affecting transactional notices required to operate your account.',
    ],
  },
  {
    heading: '4. No sale of personal data',
    paragraphs: [
      'We do not sell, rent or trade personal user data. We will not grant a third party independent rights to use your personal data for its own advertising or unrelated commercial purposes unless you have given separate, explicit and informed consent and the use is lawful.',
      'Where explicit consent is relied on, it must describe the intended recipient and purpose and may be withdrawn for future processing. We do not sell authentication information, sensitive financial details or payment-security information under any circumstances.',
    ],
  },
  {
    heading: '5. Service providers and lawful disclosure',
    paragraphs: [
      'We may share the minimum necessary information with vetted providers that support hosting, databases, cloud image storage, email delivery, FPL data, fraud prevention, payments, banking, analytics and customer support. Those providers act under contractual or legal duties and may use the information only for the permitted service.',
      'We may disclose information where required by law, court order, regulator, payment-provider rule, fraud investigation, protection of rights or safety, enforcement of platform terms, corporate restructuring or a lawful business transfer subject to appropriate safeguards.',
    ],
  },
  {
    heading: '6. Public and competition information',
    paragraphs: [
      'Your display name, profile picture, fantasy team name, qualifying scores, ranks, wins and competition history may be visible to authenticated users or the public where needed for transparent standings and results. We do not display your email address, phone number, date of birth, beneficiary bank details, wallet identifier or authentication information as part of a public player profile.',
    ],
  },
  {
    heading: '7. Security',
    paragraphs: [
      'We use measures such as password hashing, HTTP-only session cookies, access controls, audit records, server-side validation, transaction references, reconciliation and restricted administrative access. No system is completely secure, and you remain responsible for protecting your devices, email account and credentials.',
      SECURITY_WARNING,
    ],
  },
  {
    heading: '8. Retention',
    paragraphs: [
      'We retain information for as long as reasonably necessary to provide the service, maintain financial and competition integrity, resolve disputes, prevent fraud and meet legal, tax, accounting, payment-provider and audit obligations. Transaction, settlement, consent and security records may be retained after account closure where required for those purposes.',
    ],
  },
  {
    heading: '9. International processing',
    paragraphs: [
      'Some service providers may process information outside Zimbabwe. Where that occurs, we use reasonable contractual, technical and organisational safeguards appropriate to the information and the service involved.',
    ],
  },
  {
    heading: '10. Your choices and rights',
    paragraphs: [
      'Subject to applicable law and necessary verification, you may request access, correction, deletion, restriction or a copy of certain personal information, and may object to or withdraw consent for optional processing. Some records cannot be deleted immediately where retention is required for financial, security, dispute or legal purposes.',
      'Requests must be submitted through official support. We may ask for information needed to confirm identity and protect the account.',
    ],
  },
  {
    heading: '11. Children',
    paragraphs: [
      'The service is for adults aged 18 or older. We do not knowingly permit a minor to create an account. An account may be suspended and information handled in accordance with law where age information is false or a minor’s use is identified.',
    ],
  },
  {
    heading: '12. Changes and contact',
    paragraphs: [
      'We may update this Policy as the service, providers or legal requirements change. Material updates will be communicated through the platform or registered email and may require renewed consent where the law requires it.',
      'Privacy and security questions should be submitted through the official in-platform support area. Do not send passwords, OTPs, PINs, CVCs or full payment-card details.',
    ],
  },
];
