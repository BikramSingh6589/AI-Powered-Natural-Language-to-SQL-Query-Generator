const fs = require('fs');
const pages = ['Login','Register','OTPVerification','ForgotPassword','ResetPassword','LandingPage','Dashboard','CSVUpload','DatabaseConnection','QueryGenerator','Results','QueryHistory','Profile','Settings'];
pages.forEach(p => {
  fs.writeFileSync(`frontend/src/pages/${p}.tsx`, `import React from 'react';\n\nexport const ${p}: React.FC = () => {\n  return (\n    <div>\n      <h1 className="text-2xl font-bold">${p}</h1>\n    </div>\n  );\n};\n`);
});
console.log("Pages created successfully");
