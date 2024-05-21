const cepInput = document.getElementById('cepInput');
const searchBtn = document.getElementById('searchBtn');
const saveBtn = document.getElementById('saveBtn');
const addressResult = document.getElementById('addressResult');
const addressTableBody = document.getElementById('addressTableBody');

displayAddresses(getAddress())

let lastConsult = null;

searchBtn.addEventListener('click', async () => {

    clearAddressResult()

    const cep = removeDotAndDashFromCep(cepInput.value)

    if (cep.length !== 8) {
        cepError('CEP Inválido! Utilize o formato: xxxxx-xxx')
        return;
    }

    if (!isOnlyNumber(cep)) {
        console.log("cep: ", cep)
        cepError('CEP deve conter apenas números! Utilize o formato: xxxxx-xxx')
        return;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)

    if (!response.ok) {
        cepError('CEP não encontrado!')
        return;
    }

    lastConsult = await response.json()

    if (lastConsult.erro) {
        cepError('CEP não encontrado!')
        return;
    }

    addressResult.innerHTML = `
        <div class="alert alert-success mt-3">
            <strong>CEP:</strong> ${lastConsult.cep}<br>
            <strong>Logradouro:</strong> ${lastConsult.logradouro}<br>
            <strong>Complemento:</strong> ${lastConsult.complemento}<br>
            <strong>Bairro:</strong> ${lastConsult.bairro}<br>
            <strong>Cidade:</strong> ${lastConsult.localidade}<br>
            <strong>Estado:</strong> ${lastConsult.uf}<br>
        </div>
    `
    saveBtn.style.display = 'inline-block';
})

saveBtn.addEventListener('click', () => {

    if (getAddress().find(address => address.cep === lastConsult.cep)) {
        cepError('Você já salvou esse endereço!')
        return;
    }

    saveAddress(lastConsult)

    // manter a ordenação
    if (lastSortedColumn) {
        sortTable(lastSortedColumn, false)
    } else {
        displayAddresses(getAddress())
    }

    clearAddressResult()
    clearCepInput()

    addressResult.innerHTML = `<div class="alert alert-success mt-3">Endereço salvo com sucesso!</div>`
});

function clearAddressResult() {
    addressResult.innerHTML = ''
    saveBtn.style.display = 'none';
}


function getAddress() {
    return localStorage.getItem('addresses') ? JSON.parse(localStorage.getItem('addresses')) : [];
}

function saveAddress(address) {
    const addresses = getAddress();
    addresses.push(address);
    localStorage.setItem('addresses', JSON.stringify(addresses));
}

function displayAddresses(addresses) {
    addressTableBody.innerHTML = '';
    addresses.forEach(address => {
        addressTableBody.innerHTML += `
            <tr>
                <td>${address.cep}</td>
                <td>${address.logradouro}</td>
                <td>${address.complemento}</td>
                <td>${address.bairro}</td>
                <td>${address.localidade}</td>
                <td>${address.uf}</td>
            </tr>
        `;
    });
}

let sortState = {};
let lastSortedColumn = null;

function sortTable(column, changeSortState = true) {

    lastSortedColumn = column;

    if (!sortState[column]) {
        sortState[column] = 'asc';
    } else if (changeSortState) {
        sortState[column] = sortState[column] === 'asc' ? 'desc' : 'asc';
    }

    const addresses = getAddress();
    addresses.sort((a, b) => {
        let valA = a[column].toUpperCase();
        let valB = b[column].toUpperCase();

        if (valA < valB) return sortState[column] === 'asc' ? -1 : 1;
        if (valA > valB) return sortState[column] === 'asc' ? 1 : -1;
        return 0;
    });

    displayAddresses(addresses);
}

function removeDotAndDashFromCep(cep) {
    return cep.replace('.', '').replace('-', '')
}

function clearCepInput() {
    cepInput.value = ''
}

function cepError(error) {
    addressResult.innerHTML = `<div class="alert alert-danger mt-3">${error}</div>`
    clearCepInput()
    saveBtn.style.display = 'none';
}

// author: https://stackoverflow.com/a/1779019
function isOnlyNumber(val) {
    return /^\d+$/.test(val);
}