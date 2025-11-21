/// <reference types="cypress"/>

describe('Teste Backend', () => {
   let token

   before(() =>{
      cy.getToken('vnaygard@gmail.com', 'v1v1@curso')
         .then(tkn => {
            token = tkn
         })
   })
   beforeEach(() => {
      cy.resetRest()
   })
   it('Inserir conta', () => {
      cy.request({
         url: '/contas',
         method: 'POST',
         headers: {Authorization:`JWT ${token}` },           
         body:{
           nome: 'Conta via rest'              
         }
         }).as('response')
      cy.get('@response').then(res => {
         expect(res.status).to.be.equal(201)
         expect(res.body).to.have.property('id')
         expect(res.body).to.have.property( 'nome', 'Conta via rest') 
      })
   })
   it('Alterar conta', () => {
      cy.request({
         method: 'GET',
         url: '/contas',
         headers: {Authorization:`JWT ${token}` },
         qs: {
            nome: 'Conta para alterar'
          } 
         }).then(res => {
            cy.request({
               url:`/contas/${res.body[0].id}`,
               method: 'PUT',
               headers: {Authorization:`JWT ${token}` }, 
               body: {
                  nome: 'Conta alterada via rest' 
               }
            }).as('response')
         })
         cy.get('@response').its('status').should('be.equal', 200)
   })
   it('Inserir conta com mesmo nome', () => {
       cy.request({
            url: '/contas',
            method: 'POST',
            headers: { Authorization: `JWT ${token}` },
            body: {
                nome: 'Conta mesmo nome'
            },
            failOnStatusCode: false
        }).as('response')
          cy.get('@response').then(res => {
            console.log(res)
            expect(res.status).to.be.equal(400)
            expect(res.body.error).to.be.equal('Já existe uma conta com esse nome!')
         })
   })
   it('Criar transação para conta', () => {
      cy.getContaByName('Conta para movimentacoes')
         .then(contaId => {
            cy.request({
         method: 'POST',
         url: '/transacoes',
         headers: { Authorization: `JWT ${token}` },
          body: {
            conta_id: contaId,
            data_pagamento: '10/10/2025', //Cypress.moment().add({ days: 1 }).format('DD/MM/YYYY'),
            data_transacao: '10/10/2025', //Cypress.moment().format('DD/MM/YYYY'),
            descricao: "Descrição da transação",
            envolvido: "Vivian",
            status: true,
            tipo: "REC",
            valor: "1000",
           }
         }).as('response')
      })
      cy.get('@response').its('status').should('be.equal', 201)
      cy.get('@response').its('body.id').should('exist')
   })
   
   it.only('Validar Saldo', () => {
      cy.request({
            url: '/saldo',
            method: 'GET',
            headers: { Authorization: `JWT ${token}` }
        }).then(res => {
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('534.00')
        })
      cy.request({
            method: 'GET',
            url: '/transacoes',
            headers: { Authorization: `JWT ${token}` },
            qs: { descricao: 'Movimentacao 1, calculo saldo' }
        }).then(res => {
            console.log(res.body[0])
            cy.request({
                url: `/transacoes/${res.body[0].id}`,
                method: 'PUT',
                headers: { Authorization: `JWT ${token}` },
                body: {
                    status: true,
                    data_transacao: '17/11/2025', //Cypress.moment(res.body[0].data_transacao).format('DD/MM/YYYY'),
                    data_pagamento: '17/11/2025', //Cypress.moment(res.body[0].data_pagamento).format('DD/MM/YYYY'),
                    descricao: res.body[0].descricao,
                    envolvido: res.body[0].envolvido,
                    valor: res.body[0].valor,
                    conta_id: res.body[0].conta_id
                }
            }).its('status').should('be.equal', 200)
        })

        cy.request({
            url: '/saldo',
            method: 'GET',
            headers: { Authorization: `JWT ${token}` }
        }).then(res => {
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('4034.00')
        })
   })
})
