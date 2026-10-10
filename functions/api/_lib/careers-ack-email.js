export function renderCareersAckEmail(fullName, roleTitle) {
  const esc = (s) => (s || "").toString().replace(/[<>"&]/g, c => ({"<":"&lt;",">":"&gt;","\"":"&quot;","&":"&amp;"})[c]);
  const firstToken = (fullName || "").toString().trim().split(/\s+/)[0];
  const firstName = firstToken ? esc(firstToken) : "there";
  const safeRole = esc(roleTitle);
  const rolePhrase = safeRole ? `the ${safeRole} role` : "a role at Ché Orika Group";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="only light">
    <title>Application Received · Ché Orika Group</title>
    <style>
      body, table, td, p, div, span, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
      img { border:0; outline:none; text-decoration:none; display:block; }
      a { text-decoration:none; }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#FDF9F5; font-family:Georgia,'Times New Roman',serif;">
    <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#FDF9F5;">
      We've received your application. Our team will review it and contact shortlisted candidates.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FDF9F5" style="background-color:#FDF9F5;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">

            <!-- HEADER -->
            <tr>
              <td style="background-color:#2E1F16; padding:28px 32px; text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif; font-size:22px; font-weight:700; color:#FFFFFF; letter-spacing:0.08em;">Ché <span style="font-style:italic; font-weight:400;">Orika</span> Group</div>
                <div style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:#C9A84C; margin-top:6px;">We're Hiring</div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="background-color:#FDF9F5; padding:44px 32px 16px 32px;">
                <p style="font-family:Georgia,'Times New Roman',serif; font-size:18px; line-height:1.5; color:#2E1F16; margin:0 0 22px 0;">Hi ${firstName},</p>

                <p style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:1.7; color:#2E1F16; margin:0 0 18px 0;">Thank you for applying to ${rolePhrase} at Ché Orika Group. We are genuinely excited to go through your application.</p>

                <p style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:1.7; color:#2E1F16; margin:0 0 18px 0;">We are a small team, so every application gets read carefully. No filters, no software. A real person will review what you sent.</p>

                <p style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:1.7; color:#2E1F16; margin:0 0 18px 0;">We will be in touch with shortlisted candidates within the next two weeks. If you do not hear from us within that time, it means we have moved forward with other candidates for this round, but we genuinely appreciate the time and thought you put into your application.</p>
              </td>
            </tr>

            <!-- WHILE YOU WAIT -->
            <tr>
              <td style="background-color:#FDF9F5; padding:0 32px 16px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5EDDA; border-radius:8px;">
                  <tr>
                    <td style="padding:24px 28px;">
                      <div style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:10px; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:#C9A84C; margin-bottom:12px;">While you wait, get to know us</div>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding:4px 0;">
                            <a href="https://cheorika.com" style="font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#2E1F16; text-decoration:none;">Ché Orika Boutique → <span style="color:#5a3e30;">cheorika.com</span></a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0;">
                            <a href="https://thepatternhouse.co" style="font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#2E1F16; text-decoration:none;">The Pattern House → <span style="color:#5a3e30;">thepatternhouse.co</span></a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- SIGNATURE -->
            <tr>
              <td style="background-color:#FDF9F5; padding:24px 32px 48px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="height:1px; line-height:1px; font-size:0; background-color:#C9A84C; width:40px;">&nbsp;</td></tr>
                </table>
                <div style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:1.6; color:#2E1F16; margin-top:20px;">Best regards,</div>
                <div style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:1.6; color:#2E1F16; margin-top:2px;">Ché Orika Group</div>
                <div style="font-family:'Helvetica Neue',Arial,sans-serif; font-weight:500; font-size:11px; letter-spacing:0.22em; color:#5a3e30; text-transform:uppercase; margin-top:6px;">Abuja, Nigeria</div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background-color:#2E1F16; padding:20px 32px; text-align:center;">
                <div style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:10px; letter-spacing:0.15em; color:#5a3e30;">careers@cheorika.com · cheorika.com · thepatternhouse.co</div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
