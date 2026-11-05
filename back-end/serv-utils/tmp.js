import crypto from 'crypto';

function hash(pwd, salt) {
  return new Promise((resolve, reject) => {
    if (typeof pwd !== 'string' || typeof salt !== 'string') {
      reject(new TypeError('Password and salt must be strings.'));
      return;
    }
    crypto.scrypt(pwd, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(derivedKey.toString('hex'));
    });
  });
}

async function generateSQL() {
  // 从终端读取参数，格式：node make-test-user.mjs <id> <pwd> [email]
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n❌ 缺少参数！');
    console.log('用法: node make-test-user.mjs <id> <password> [email]');
    console.log('示例: node make-test-user.mjs TestUser MyPass123! test@example.com\n');
    process.exit(1);
  }

  const id = args[0];
  const pwd = args[1];
  const email = args[2] || `${id.toLowerCase()}@example.com`; // 如果没传 email，自动生成一个
  
  // 生成随机 salt
  const salt = crypto.randomBytes(16).toString('hex'); 
  
  // 计算 hash
  const hashHex = await hash(pwd, salt);

  // 生成 SQL 语句
  const sql = `
INSERT INTO users (id, pwd, salt, email, verified) 
VALUES ('${id}', '${hashHex}', '${salt}', '${email}', true);
  `.trim();

  console.log('\n--- 复制下面的 SQL 到数据库执行 ---\n');
  console.log(sql);
  console.log('\n--- 登录信息 ---');
  console.log(`ID:    ${id}`);
  console.log(`Email: ${email}`);
  console.log(`密码:  ${pwd}`);
  console.log('--------------------------------------\n');
}

generateSQL();