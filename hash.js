const bcrypt = require('bcrypt');

async function test() {
    const password = '';

    const hash = await bcrypt.hash(password, 10);
    console.log('Hash:', hash);
}

test();