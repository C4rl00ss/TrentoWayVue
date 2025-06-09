import { reactive } from "vue";


const loggedUser = reactive({
    token: undefined,
    user: {
        id: undefined,
        email: undefined,
        username: undefined,
        role: undefined
    },
    isLoggedIn: false
})

function setLoggedUser(data) {
    loggedUser.token = data.token;
    loggedUser.user.id = data.user.id;
    loggedUser.user.email = data.user.email;
    loggedUser.user.username = data.user.username;
    loggedUser.user.role = data.user.ruolo;
    loggedUser.isLoggedIn = true;
}

function clearLoggedUser() {
    loggedUser.token = undefined;
    loggedUser.user.id = undefined;
    loggedUser.user.email = undefined;
    loggedUser.user.username = undefined;
    loggedUser.user.role = undefined;
    loggedUser.isLoggedIn = false;
}

export { loggedUser, setLoggedUser, clearLoggedUser }
