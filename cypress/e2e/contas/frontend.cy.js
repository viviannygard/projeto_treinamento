/// <reference types="cypress" />

import loc from '../../support/locators'
import '../../support/commandsContas'
import buildEnv from '../../support/buildEnv'

describe('Login', () => {
    after(() => {
        cy.clearLocalStorage()
    })
    beforeEach(() => {
        cy.visit('https://barrigareact.wcaquino.me')   // 1. acessar app
        buildEnv()                                    // 2. mockar backend
        cy.login('vnaygard@gmail.com', 'v1v1@curso')  // 3. fazer login mockado
        cy.get(loc.MENU.HOME).click()                 // 4. usar o menu
    })
    it('Validar responsivo', () => {
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.visible')
        cy.viewport(500, 700)
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')
        cy.viewport('iphone-5')
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')
        cy.viewport('ipad-2')
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.visible')
    })

    // it.only('Validar cadastrar conta', () => {
    //     cy.acessarMenuConta()
    //     cy.inserirConta('Conta de teste 01')
    //     //cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso!')   
    //     cy.get(loc.MESSAGE, { timeout: 7000 }).should('contain', 'Conta inserida com sucesso!')      
    // })
    it('Validar cadastrar conta', () => {
        cy.intercept('POST', '/contas', {
            id: 3,
            nome: 'Conta de teste',
            visivel: true,
            usuario_id: 1
        }).as('saveConta')
        cy.acessarMenuConta()
        cy.intercept('GET', '/contas', [
            { id: 1, nome: 'Carteira', visivel: true, usuario_id: 1 },
            { id: 2, nome: 'Banco', visivel: true, usuario_id: 1 },
            { id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1 },
        ]).as('contasSave')
        cy.inserirConta('Conta de teste')
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
    })
    //it('Validar atualização da conta', () => {
    //    cy.acessarMenuConta()
    //    cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Conta para alterar')).click()
    //    cy.get(loc.CONTAS.NOME)
    //        .clear()
    //        .type('Conta alterada')
    //    cy.wait(6000)
    //    cy.get(loc.CONTAS.BTN_SALVAR).click()
    //    cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso')
    //})
    it('Validar atualização da conta', () => {
        cy.intercept(
            'PUT',
            '/contas/**',
            {
                id: 1,
                nome: 'Conta alterada',
                visivel: true,
                usuario_id: 1
            }
        ).as('updateConta')
        cy.acessarMenuConta()
        cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Banco')).click()
        cy.get(loc.CONTAS.NOME)
            .clear()
            .type('Conta alterada')
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        //cy.wait('@updateConta') // opcional, mas recomendado
        cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso')
    })
    it('Validar conta com mesmo nome', () => {
        //cy.acessarMenuConta()
        //cy.get(loc.CONTAS.NOME).type('Conta mesmo nome')
        //cy.wait(6000)
        //cy.get(loc.CONTAS.BTN_SALVAR).click()
        //cy.get(loc.MESSAGE).should('contain', 'code 400')
        cy.intercept(
            {
                method: 'POST',
                url: '/contas'
            },
            {
                statusCode: 400,
                body: { error: "Já existe uma conta com esse nome!" }
            }
        ).as('saveContaMesmoNome')

        cy.acessarMenuConta()

        cy.get(loc.CONTAS.NOME).type('Conta mesmo nome')
        cy.get(loc.CONTAS.BTN_SALVAR).click()

        //cy.wait('@saveContaMesmoNome')

        cy.get(loc.MESSAGE)
            .should('contain', 'Já existe uma conta com esse nome!')
    })

    it('Criar movimentação de transações', () => {

        cy.intercept({
            method: 'POST',
            url: '/transacoes'
        }, {
            id: 31433,
            descricao: "asdasd",
            envolvido: "sdfsdfs",
            observacao: null,
            tipo: "DESP",
            data_transacao: "2019-11-13T03:00:00.000Z",
            data_pagamento: "2019-11-13T03:00:00.000Z",
            valor: "232.00",
            status: false,
            conta_id: 42069,
            usuario_id: 1,
            transferencia_id: null,
            parcelamento_id: null
        }).as('postTransacao')


        cy.intercept({
            method: 'GET',
            url: '/extrato/**'
        }, { fixture: 'movimentacaoSalva' }).as('getExtrato')

        cy.get(loc.MENU.MOVIMENTACAO).click()

        cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Desc')
        cy.get(loc.MOVIMENTACAO.VALOR).type('123')
        cy.get(loc.MOVIMENTACAO.INTERESSADO).type('Inter')
        cy.get(loc.MOVIMENTACAO.CONTA).select('Banco')
        cy.get(loc.MOVIMENTACAO.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()

        cy.wait('@postTransacao')

        cy.get(loc.MESSAGE).should('contain', 'sucesso')

        cy.wait('@getExtrato')

        cy.get(loc.EXTRATO.LINHAS).should('have.length', 7)
        cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Desc', '123')).should('exist')
        //cy.get(loc.MENU.MOVIMENTACAO).click();
        //cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Desc')
        //cy.get(loc.MOVIMENTACAO.VALOR).type('123')
        //cy.get(loc.MOVIMENTACAO.INTERESSADO).type('Inter')
        //cy.get(loc.MOVIMENTACAO.CONTA).select('Conta para movimentacoes')
        //cy.get(loc.MOVIMENTACAO.STATUS).click()
        //cy.wait(6000)
        //cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        //cy.get(loc.MESSAGE).should('contain', 'sucesso')
        //
        //cy.get(loc.EXTRATO.LINHAS).should('have.length', 7)
        //cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Desc', '123')).should('exist')
    })
    it('Validar saldo', () => {
        // 1 - Substitui o saldo inicial ANTES de acessar o HOME
        cy.intercept('GET', '/saldo*', [
            {
                conta_id: 999,
                conta: "Carteira",
                saldo: "100.00"
            },
            {
                conta_id: 9909,
                conta: "Banco",
                saldo: "10000000.00"
            }
        ]).as('saldoInicial')

        cy.get(loc.MENU.HOME).click()
        //cy.wait('@saldoInicial')


        // ===========================================
        // Mock da transação para edição
        // ===========================================

        cy.intercept('GET', '/transacoes/**', {
            "conta": "Conta para saldo",
            "id": 31436,
            "descricao": "Movimentacao 1, calculo saldo",
            "envolvido": "CCC",
            "observacao": null,
            "tipo": "REC",
            "data_transacao": "2019-11-13T03:00:00.000Z",
            "data_pagamento": "2019-11-13T03:00:00.000Z",
            "valor": "3500.00",
            "status": false,
            "conta_id": 42079,
            "usuario_id": 1,
            "transferencia_id": null,
            "parcelamento_id": null
        })

        cy.intercept('PUT', '/transacoes/**', {
            "conta": "Conta para saldo",
            "id": 31436,
            "descricao": "Movimentacao 1, calculo saldo",
            "envolvido": "CCC",
            "observacao": null,
            "tipo": "REC",
            "data_transacao": "2019-11-13T03:00:00.000Z",
            "data_pagamento": "2019-11-13T03:00:00.000Z",
            "valor": "3500.00",
            "status": true,
            "conta_id": 42079,
            "usuario_id": 1,
            "transferencia_id": null,
            "parcelamento_id": null
        })


        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click()
        cy.get(loc.MOVIMENTACAO.DESCRICAO).should('have.value', 'Movimentacao 1, calculo saldo')
        cy.get(loc.MOVIMENTACAO.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')


        // ===========================================
        // Novo saldo após alteração
        // ===========================================

        cy.intercept('GET', '/saldo*', [
            {
                conta_id: 999,
                conta: "Carteira",
                saldo: "4034.00"
            },
            {
                conta_id: 9909,
                conta: "Banco",
                saldo: "10000000.00"
            },
        ]).as('saldoFinal')

        cy.get(loc.MENU.HOME).click()
        //cy.wait('@saldoFinal')

        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira'))
            .should('contain', '4.034,00')
    })

    it('Validar excluir movimentação', () => {
        cy.intercept('DELETE', '/transacoes/**', {
        statusCode: 204,
        body: {}
    }).as('removeTransaction');

    cy.get(loc.MENU.EXTRATO).click();
    cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click();

    cy.wait('@removeTransaction');

    cy.get(loc.MESSAGE).should('contain', 'sucesso');
        //cy.get(loc.MENU.EXTRATO).click()
        //cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click()
        //cy.get(loc.MESSAGE).should('contain', 'sucesso')
    })
})