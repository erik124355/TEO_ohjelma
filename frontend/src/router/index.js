import { createRouter, createWebHistory } from 'vue-router'

import Auth from '../views/auth.vue'
import Oppilas from '../views/oppilas.vue'
import Opettaja from '../views/opettaja.vue'
import Ohjaaja from '../views/ohjaaja.vue'

import axios from 'axios'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Auth
    },
    {
        path: '/oppilas',
        name: 'Oppilas',
        component: Oppilas
    },
    {
        path: '/opettaja',
        name: 'Opettaja',
        component: Opettaja
    },
    {
        path: '/ohjaaja',
        name: 'Ohjaaja',
        component: Ohjaaja
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})


// Tarkistetaan kirjautuminen ennen sivulle menemistä
router.beforeEach(async (to) => {

    try {

        const response = await axios.get(
            'http://localhost:3001/session',
            {
                withCredentials: true
            }
        )

        const user = response.data.user

        // Jos käyttäjä menee login-sivulle vaikka on jo kirjautunut
        if (to.path === '/') {

            if (user.role === 'Oppilas') {
                return '/oppilas'
            }

            if (user.role === 'Opettaja') {
                return '/opettaja'
            }

            if (user.role === 'Ohjaaja') {
                return '/ohjaaja'
            }

        }


        // Tarkistetaan että käyttäjä menee oman roolinsa sivulle

        if (to.path === '/oppilas' && user.role !== 'Oppilas') {

            if (user.role === 'Opettaja') {
                return '/opettaja'
            }

            if (user.role === 'Ohjaaja') {
                return '/ohjaaja'
            }
        }


        if (to.path === '/opettaja' && user.role !== 'Opettaja') {

            if (user.role === 'Oppilas') {
                return '/oppilas'
            }

            if (user.role === 'Ohjaaja') {
                return '/ohjaaja'
            }
        }


        if (to.path === '/ohjaaja' && user.role !== 'Ohjaaja') {

            if (user.role === 'Oppilas') {
                return '/oppilas'
            }

            if (user.role === 'Opettaja') {
                return '/opettaja'
            }
        }


        return true

    } catch (error) {

        // Ei kirjautunutta käyttäjää
        if (to.path !== '/') {
            return '/'
        }

        return true
    }
})

export default router