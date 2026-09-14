const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

//Haetaan tietokanta .env tiedostosta
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})  

//Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

//Tarkistetaan session
const isAuth = (req, res, next) => {
    if (req.session.user) {
        next(); 
    } else {
        res.status(401).json({ loggedIn: false, message: "Please log in first" });
    }
};

//Reititi
app.post('/login', (req, res) => {
    const { name, password } = req.body;

    db.execute(
        'SELECT * FROM users WHERE Name = ?',
        [name],
        async (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                console.log("NO USER FOUND");
                return res.status(401).json({
                    message: 'Invalid credentials'
                });
            }

            const user = results[0];

            const passwordCorrect = await bcrypt.compare(
                password,
                user.Password
            );

            if (!passwordCorrect) {
                return res.status(401).json({
                    message: 'Invalid credentials'
                });
            }

            req.session.user = {
                id: user.UserID,
                name: user.Name,
                role: user.Role
            };

            res.json({
                message: 'Logged in',
                user: {
                    id: user.UserID,
                    name: user.Name,
                    role: user.Role
                }
            });
        }
    );
});


// Haetaan kaikki oppilaat
app.get('/students', isAuth, (req, res) => {

    db.execute(
        `SELECT UserID, Name, Luokka, Role
         FROM users
         WHERE Role = 'Oppilas'`,
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            res.json(results);
        }
    );
});


// Lisätään uusi oppilas
app.post('/students', isAuth, async (req, res) => {

    const { name, luokka, password } = req.body;

    if (!name || !luokka || !password) {
        return res.status(400).json({
            message: 'Name, class and password are required'
        });
    }

    try {

        // Salataan salasana bcryptillä
        const hashedPassword = await bcrypt.hash(password, 10);

        db.execute(
            `INSERT INTO users (Role, Name, Password, Luokka)
             VALUES ('Oppilas', ?, ?, ?)`,
            [name, hashedPassword, luokka],
            (err, result) => {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        message: 'Database error'
                    });
                }

                res.status(201).json({
                    message: 'Student added',
                    id: result.insertId
                });
            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error hashing password'
        });
    }
});


// Muokataan oppilasta
app.put('/students/:id', isAuth, async (req, res) => {

    const studentId = req.params.id;
    const { name, luokka, password } = req.body;

    if (!name || !luokka) {
        return res.status(400).json({
            message: 'Name and class are required'
        });
    }

    try {

        // Jos salasanaa ei muuteta
        if (!password) {

            db.execute(
                `UPDATE users
                 SET Name = ?, Luokka = ?
                 WHERE UserID = ?
                 AND Role = 'Oppilas'`,
                [name, luokka, studentId],
                (err, result) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            message: 'Database error'
                        });
                    }

                    res.json({
                        message: 'Student updated'
                    });
                }
            );

        } else {

            // Jos salasana vaihdetaan
            const hashedPassword = await bcrypt.hash(password, 10);

            db.execute(
                `UPDATE users
                 SET Name = ?, Luokka = ?, Password = ?
                 WHERE UserID = ?
                 AND Role = 'Oppilas'`,
                [name, luokka, hashedPassword, studentId],
                (err, result) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            message: 'Database error'
                        });
                    }

                    res.json({
                        message: 'Student updated'
                    });
                }
            );
        }

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error hashing password'
        });
    }
});


// Poistetaan oppilas
app.delete('/students/:id', isAuth, (req, res) => {

    const studentId = req.params.id;

    db.execute(
        `DELETE FROM users
         WHERE UserID = ?
         AND Role = 'Oppilas'`,
        [studentId],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Student not found'
                });
            }

            res.json({
                message: 'Student deleted'
            });
        }
    );
});

app.get('/session', (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            loggedIn: false
        })
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    })
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {

        if (err) {
            console.error(err)

            return res.status(500).json({
                message: 'Logout failed'
            })
        }

        res.clearCookie('connect.sid')

        res.json({
            message: 'Logged out'
        })
    })
})

// Haetaan opettajat ja ohjaajat
app.get('/staff', isAuth, (req, res) => {

    db.execute(
        `SELECT UserID, Name, Role
         FROM users
         WHERE Role IN ('Opettaja', 'Ohjaaja')`,
        (err, results) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            const teachers = results.filter(
                user => user.Role === 'Opettaja'
            )

            const supervisors = results.filter(
                user => user.Role === 'Ohjaaja'
            )

            res.json({
                teachers,
                supervisors
            })
        }
    )
})

// Luodaan uusi TEO-jakso
app.post('/teojaksot', isAuth, (req, res) => {

    const {
        opiskelija,
        alku,
        loppu,
        tyopaikka,
        opettaja,
        ohjaaja
    } = req.body

    if (!opiskelija || !alku || !loppu) {
        return res.status(400).json({
            message: 'Student, start date and end date are required'
        })
    }

    db.execute(
        `INSERT INTO teojakso
        (Alku, Loppu, Tyopaikka, Opiskelija, Opettaja, Ohjaaja)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            alku,
            loppu,
            tyopaikka || null,
            opiskelija,
            opettaja || null,
            ohjaaja || null
        ],
        (err, result) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            res.status(201).json({
                message: 'TEO-jakso created',
                id: result.insertId
            })
        }
    )
})


// Muokataan TEO-jaksoa
app.put('/teojaksot/:id', isAuth, (req, res) => {

    const teoId = req.params.id

    const {
        alku,
        loppu,
        tyopaikka,
        opettaja,
        ohjaaja
    } = req.body

    if (!alku || !loppu) {
        return res.status(400).json({
            message: 'Start date and end date are required'
        })
    }

    db.execute(
        `UPDATE teojakso
         SET Alku = ?,
             Loppu = ?,
             Tyopaikka = ?,
             Opettaja = ?,
             Ohjaaja = ?
         WHERE TeojaksoID = ?`,
        [
            alku,
            loppu,
            tyopaikka || null,
            opettaja || null,
            ohjaaja || null,
            teoId
        ],
        (err, result) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'TEO-jakso not found'
                })
            }

            res.json({
                message: 'TEO-jakso updated'
            })
        }
    )
})

// Haetaan kaikki opiskelijan TEO-jaksot
app.get('/teojaksot/student/:id', isAuth, (req, res) => {

    const studentId = req.params.id

    db.execute(
        `SELECT
            TeojaksoID,
            DATE_FORMAT(Alku, '%Y-%m-%d') AS Alku,
            DATE_FORMAT(Loppu, '%Y-%m-%d') AS Loppu,
            Tyopaikka,
            Opiskelija,
            Opettaja,
            Ohjaaja
         FROM teojakso
         WHERE Opiskelija = ?
         ORDER BY Alku ASC`,
        [studentId],
        (err, results) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            res.json(results)
        }
    )
})

//haetaan näyttö
app.get('/naytot/teojakso/:id', isAuth, (req, res) => {

    const teoId = req.params.id

    db.execute(
        `SELECT
            NayttoID,
            DATE_FORMAT(Paiva, '%Y-%m-%d') AS Paiva,
            Arvosana,
            Tila,
            Teojakso
         FROM naytto
         WHERE Teojakso = ?
         LIMIT 1`,
        [teoId],
        (err, results) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            if (results.length === 0) {
                return res.json(null)
            }

            res.json(results[0])
        }
    )
})

// Luodaan uusi näyttö
app.post('/naytot', isAuth, (req, res) => {

    const {
        paiva,
        arvosana,
        tila,
        teojakso
    } = req.body

    if (!teojakso || !tila) {
        return res.status(400).json({
            message: 'TEO-jakso and status are required'
        })
    }

    db.execute(
        `INSERT INTO naytto
        (Paiva, Arvosana, Tila, Teojakso)
        VALUES (?, ?, ?, ?)`,
        [
            paiva || null,
            arvosana || null,
            tila,
            teojakso
        ],
        (err, result) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            res.status(201).json({
                message: 'Näyttö created',
                id: result.insertId
            })
        }
    )
})

// Muokataan näyttöä
app.put('/naytot/:id', isAuth, (req, res) => {

    const nayttoId = req.params.id

    const {
        paiva,
        arvosana,
        tila
    } = req.body

    if (!tila) {
        return res.status(400).json({
            message: 'Status is required'
        })
    }

    db.execute(
        `UPDATE naytto
         SET Paiva = ?,
             Arvosana = ?,
             Tila = ?
         WHERE NayttoID = ?`,
        [
            paiva || null,
            arvosana || null,
            tila,
            nayttoId
        ],
        (err, result) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Näyttö not found'
                })
            }

            res.json({
                message: 'Näyttö updated'
            })
        }
    )
})

// Haetaan kaikki opiskelijan päiväkirjamerkinnät tietylle TEO-jaksolle
app.get('/paivakirja/teojakso/:id', isAuth, (req, res) => {

    const teoId = req.params.id
    const studentId = req.session.user.id

    db.execute(
        `SELECT
            PaivakirjaID,
            DATE_FORMAT(Paiva, '%Y-%m-%d') AS Paiva,
            Paivitys,
            Opiskelija,
            Teojakso

         FROM paivakirja

         WHERE Teojakso = ?
         AND Opiskelija = ?

         ORDER BY Paiva DESC`,

        [teoId, studentId],

        (err, results) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            res.json(results)
        }
    )
})

// Luodaan uusi päiväkirjamerkintä
app.post('/paivakirja', isAuth, (req, res) => {

    const {
        paiva,
        paivitys,
        teojakso
    } = req.body

    const studentId = req.session.user.id

    if (!paiva || !paivitys || !teojakso) {
        return res.status(400).json({
            message: 'Päivä, päivitys ja TEO-jakso vaaditaan'
        })
    }

    db.execute(
        `SELECT TeojaksoID
         FROM teojakso
         WHERE TeojaksoID = ?
         AND Opiskelija = ?`,

        [teojakso, studentId],

        (err, results) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            if (results.length === 0) {
                return res.status(403).json({
                    message: 'Tämä TEO-jakso ei kuulu sinulle'
                })
            }

            db.execute(
                `INSERT INTO paivakirja
                (Paiva, Paivitys, Opiskelija, Teojakso)

                VALUES (?, ?, ?, ?)`,

                [
                    paiva,
                    paivitys,
                    studentId,
                    teojakso
                ],

                (err, result) => {

                    if (err) {
                        console.error(err)

                        return res.status(500).json({
                            message: 'Database error'
                        })
                    }

                    res.status(201).json({
                        message: 'Päiväkirjapäivitys tallennettu',
                        id: result.insertId
                    })
                }
            )
        }
    )
})

// Muokataan päiväkirjamerkintää
app.put('/paivakirja/:id', isAuth, (req, res) => {

    const diaryId = req.params.id
    const studentId = req.session.user.id

    const {
        paiva,
        paivitys
    } = req.body

    if (!paiva || !paivitys) {
        return res.status(400).json({
            message: 'Päivä ja päivitys vaaditaan'
        })
    }

    db.execute(
        `UPDATE paivakirja

         SET
            Paiva = ?,
            Paivitys = ?

         WHERE PaivakirjaID = ?
         AND Opiskelija = ?`,

        [
            paiva,
            paivitys,
            diaryId,
            studentId
        ],

        (err, result) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Päiväkirjamerkintää ei löytynyt'
                })
            }

            res.json({
                message: 'Päiväkirjamerkintä päivitetty'
            })
        }
    )
})

// Poistetaan päiväkirjamerkintä
app.delete('/paivakirja/:id', isAuth, (req, res) => {

    const diaryId = req.params.id
    const studentId = req.session.user.id

    db.execute(
        `DELETE FROM paivakirja

         WHERE PaivakirjaID = ?
         AND Opiskelija = ?`,

        [
            diaryId,
            studentId
        ],

        (err, result) => {

            if (err) {
                console.error(err)

                return res.status(500).json({
                    message: 'Database error'
                })
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Päiväkirjamerkintää ei löytynyt'
                })
            }

            res.json({
                message: 'Päiväkirjamerkintä poistettu'
            })
        }
    )
})

// Haetaan nykyisen opiskelijan omat TEO-jaksot
app.get('/teojaksot/my', isAuth, (req, res) => {
    const studentId = req.session.user.id

    db.execute(
        `SELECT
            t.TeojaksoID,
            DATE_FORMAT(t.Alku, '%Y-%m-%d') AS Alku,
            DATE_FORMAT(t.Loppu, '%Y-%m-%d') AS Loppu,
            t.Tyopaikka,
            t.Opiskelija,
            t.Opettaja,
            t.Ohjaaja,
            o.Name AS OpettajaName,
            oh.Name AS OhjaajaName,
            n.Tila,
            n.Arvosana
         FROM teojakso t
         LEFT JOIN users o ON o.UserID = t.Opettaja
         LEFT JOIN users oh ON oh.UserID = t.Ohjaaja
         LEFT JOIN naytto n ON n.Teojakso = t.TeojaksoID
         WHERE t.Opiskelija = ?
         ORDER BY t.Alku ASC`,
        [studentId],
        (err, results) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ message: 'Database error' })
            }

            res.json(results)
        }
    )
})

// Ohjaajan oma TEO-jakson haku
app.get('/ohjaaja/teojaksot', isAuth, (req, res) => {
    const ohjaajaId = req.session.user.id

    if (req.session.user.role !== 'Ohjaaja') {
        return res.status(403).json({
            message: 'Only supervisors can access this page'
        })
    }

    db.execute(
        `SELECT
            t.TeojaksoID,
            DATE_FORMAT(t.Alku, '%Y-%m-%d') AS Alku,
            DATE_FORMAT(t.Loppu, '%Y-%m-%d') AS Loppu,
            t.Tyopaikka,
            t.Opiskelija,
            u.Name AS StudentName,
            u.Luokka,
            n.Tila AS NayttoTila,
            n.Arvosana,
            n.Paiva AS NayttoPaiva
         FROM teojakso t
         JOIN users u ON u.UserID = t.Opiskelija
         LEFT JOIN naytto n ON n.Teojakso = t.TeojaksoID
         WHERE t.Ohjaaja = ?
         ORDER BY t.Alku ASC, u.Name ASC`,
        [ohjaajaId],
        (err, results) => {
            if (err) {
                console.error(err)
                return res.status(500).json({
                    message: 'Database error'
                })
            }

            res.json(results)
        }
    )
})

// Ohjaajan TEO-jakson päiväkirjamerkinnät
app.get('/ohjaaja/paivakirja/:teoid', isAuth, (req, res) => {
    const teojaksoId = req.params.teoid
    const ohjaajaId = req.session.user.id

    if (req.session.user.role !== 'Ohjaaja') {
        return res.status(403).json({
            message: 'Only supervisors can access this page'
        })
    }

    db.execute(
        `SELECT
            p.PaivakirjaID,
            DATE_FORMAT(p.Paiva, '%Y-%m-%d') AS Paiva,
            p.Paivitys
         FROM paivakirja p
         JOIN teojakso t ON t.TeojaksoID = p.Teojakso
         WHERE p.Teojakso = ?
         AND t.Ohjaaja = ?
         ORDER BY p.Paiva DESC`,
        [teojaksoId, ohjaajaId],
        (err, results) => {
            if (err) {
                console.error(err)
                return res.status(500).json({
                    message: 'Database error'
                })
            }

            res.json(results)
        }
    )
})

// Opettajan TEO-jakson päiväkirjamerkinnät
app.get('/opettaja/paivakirja/:teoid', isAuth, (req, res) => {
    const teoId = req.params.teoid
    const teacherId = req.session.user.id

    db.execute(
        `SELECT
            p.PaivakirjaID,
            DATE_FORMAT(p.Paiva, '%Y-%m-%d') AS Paiva,
            p.Paivitys
         FROM paivakirja p
         JOIN teojakso t ON t.TeojaksoID = p.Teojakso
         WHERE p.Teojakso = ?
         AND t.Opettaja = ?
         ORDER BY p.Paiva DESC`,
        [teoId, teacherId],
        (err, results) => {
            if (err) {
                console.error(err)
                return res.status(500).json({
                    message: 'Database error'
                })
            }

            res.json(results)
        }
    )
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));