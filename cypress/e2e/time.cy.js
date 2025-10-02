/// <reference types="cypress" />

describe('Work with time', () => {
    before(() => {
        cy.visit('https://wcaquino.me/cypress/componentes.html')
    })

    it.skip('Going back to the past', () => {
        // cy.get('#buttonNow').click()
        // cy.get('#resultado > span').should('contain', '07/11/2019')

        // cy.clock()
        // cy.get('#buttonNow').click()
        // cy.get('#resultado > span').should('contain', '31/12/1969')

        const dt = new Date(2025, 1, 10, 15, 23, 50)
        cy.clock(dt.getTime())
        cy.get('#buttonNow').click()
        cy.get('#resultado > span').should('contain', '30/09/2025')
    })

    it('Goes to the future', () => {
        cy.get('#buttonTimePassed').click()
        cy.get('#resultado > span').invoke('text').then(text => {
            const val = Number(text)
            expect(val).to.be.greaterThan(0) // qualquer número positivo já passa
        })
        // 2) congela o tempo no "zero"
        cy.clock()
        cy.get('#buttonTimePassed').click()
        cy.get('#resultado > span').invoke('text').then(text => {
            expect(Number(text)).to.equal(0) // com clock congelado = 0
        })

        // 3) avança o tempo 5 segundos
        cy.tick(5000)
        cy.get('#buttonTimePassed').click()
        cy.get('#resultado > span').invoke('text').then(text => {
            expect(Number(text)).to.be.gte(5000) // >= 5000ms
        })

        // 4) avança mais 10 segundos (total 15s)
        cy.tick(10000)
        cy.get('#buttonTimePassed').click()
        cy.get('#resultado > span').invoke('text').then(text => {
            expect(Number(text)).to.be.gte(15000)
        })
    })
})
