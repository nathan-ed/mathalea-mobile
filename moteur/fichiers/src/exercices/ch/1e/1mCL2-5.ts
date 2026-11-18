import {
  type FormulaireComplexe,
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
} from '../../../lib/formulaireComplexe'
import FractionEtendue from '../../../modules/FractionEtendue'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Trinome from '../../../modules/Trinome'
import Exercice from '../../Exercice'

import { boutonReponsePredefinie } from '../../../lib/interactif/boutonReponsePredefinie'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'

export const titre =
  'Factoriser un polynôme du second degré à l’aide du discriminant'
export const interactifReady = true

export const dateDePublication = '18/11/2026'

export const uuid = 'e1c4b'

export const refs = { 'fr-fr': [], 'fr-ch': ['1mCL2-5'] }
const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'racines',
      label: 'Type de polynôme',
      poidsMax: 100,
      items: [
        { nom: 'entieres', label: 'Racines entières', poids: 3 },
        {
          nom: 'fractionnaires',
          label: 'Racines fractionnaires non entières',
          poids: 0,
        },
        {
          nom: 'nonFactorisable',
          label: 'Polynômes non factorisables sur ℝ',
          poids: 1,
        },
      ],
    },
    {
      type: 'listePonderee',
      nom: 'coefficients',
      label: 'Coefficient dominant',
      poidsMax: 100,
      items: [
        { nom: 'un', label: 'Égal à 1', poids: 0 },
        { nom: 'autre', label: 'Différent de 1', poids: 0 },
      ],
    },
    {
      type: 'listePonderee',
      nom: 'multiplicites',
      label: 'Forme des polynômes factorisables',
      poidsMax: 100,
      items: [
        {
          nom: 'distinctes',
          label: 'Deux racines distinctes non opposées',
          poids: 2,
        },
        {
          nom: 'opposees',
          label: 'Deux racines opposées (différence de carrés)',
          poids: 0,
        },
        { nom: 'double', label: 'Racine double (carré d’un binôme)', poids: 1 },
      ],
    },
  ],
}
/**
 * Adapté de 1AL22-2 (Rémi Angot et Stéphane Guyon).
 * @author Nathan Scheinmann
 */
export default class FactoriserTrinomeDiscriminant extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacingCorr = 3
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
    this.comment =
      "Par défaut, une question sur deux a deux racines entières distinctes, une sur quatre une racine double et une sur quatre aucune racine. Les poids répartissent les questions entre les types de polynôme, puis les polynômes factorisables entre les trois formes. Sans coefficient dominant coché, il est tiré au hasard. Avec des racines fractionnaires, les deux racines ont le même dénominateur (2 ou 3) et le coefficient dominant vaut ±4 ou ±9, pour garder des coefficients entiers, sauf s'il est imposé égal à 1."
  }

  nouvelleVersion() {
    this.consigne =
      'Factoriser, si cela est possible, ' +
      (this.nbQuestions !== 1 ? 'chaque' : 'le') +
      ` polynôme $P$ suivant défini pour tout $x$ de $\\mathbb R$ par${sp()}: `
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const familles = params.repartition('racines', this.nbQuestions)
    const coefficients =
      params.listeActive('coefficients').length > 0
        ? params.repartition('coefficients', this.nbQuestions)
        : []
    const multiplicites = params.repartition(
      'multiplicites',
      familles.filter((f) => f !== 'nonFactorisable').length,
    )
    let indiceFactorisable = 0
    const limiteEssais = Math.max(50, 10 * this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < limiteEssais;) {
      let texte = ''
      let texteCorr = ''
      let a: number
      let b: number | FractionEtendue
      let c: number | FractionEtendue
      const type = familles[i]
      const coefficient = coefficients[i]
      // Racines entre -5 et 5, plage élargie seulement quand une longue série
      // manquerait de polynômes différents (coefficient dominant imposé à 1).
      const borne =
        coefficient === 'un' && this.nbQuestions > 12 ? this.nbQuestions : 5
      if (type !== 'nonFactorisable') {
        // Les racines sont p/d et q/d.
        const forme = multiplicites[indiceFactorisable]
        let d = 1
        let p: number
        let q: number
        const borneRacine =
          forme !== 'distinctes' &&
          (coefficient === 'un' || type === 'fractionnaires')
            ? Math.max(5, this.nbQuestions)
            : borne
        if (type === 'fractionnaires') {
          d = choice([2, 3])
          const numerateurs = Array.from(
            { length: 2 * borneRacine + 1 },
            (_, n) => n - borneRacine,
          ).filter((n) => n % d !== 0)
          p = choice(numerateurs)
          if (forme === 'opposees') q = -p
          else if (forme === 'double') q = p
          else q = choice(numerateurs, [p, -p])
        } else {
          p = randint(-borneRacine, 2, [0])
          if (forme === 'opposees') q = -p
          else if (forme === 'double') q = p
          else q = randint(p + 1, borne, [0, -p])
        }
        if (coefficient === 'un') a = 1
        else if (d > 1) a = choice([-1, 1]) * d * d
        else a = randint(-4, 4, coefficient === 'autre' ? [0, 1] : [0])
        b = new FractionEtendue(-a * (p + q), d).simplifie()
        c = new FractionEtendue(a * p * q, d * d).simplifie()
        const trinome = new Trinome(a, b, c)
        texte = `$P(x)=${trinome.tex}$`
        texteCorr = `On a $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par ${texte}.`
        texteCorr +=
          '<br>On reconnaît un polynôme du second degré. On cherche ses éventuelles racines en calculant son discriminant.'
        texteCorr += `<br>$\\Delta = ${trinome.texCalculDiscriminant}$`
        if (forme === 'double') {
          texteCorr += `<br>$\\Delta=0$ donc $P(x)$ admet une unique racine${sp()}:`
          texteCorr += `<br> $x_0 = ${trinome.texCalculRacine1()}$.`
          texteCorr += `<br>On peut donc factoriser le polynôme sous la forme${sp()}: $P(x)=a(x-x_0)^2$.`
        } else {
          texteCorr += `<br>$\\Delta>0$ donc $P(x)$ admet deux racines${sp()}:`
          texteCorr += `<br>$${trinome.texCalculRacine1()}$`
          texteCorr += `<br>$${trinome.texCalculRacine2()}$.`
          texteCorr += `<br>On peut donc factoriser le polynôme sous la forme${sp()}: $P(x)=a(x-x_1)(x-x_2)$.`
        }
        texteCorr += `<br>$P(x)=${miseEnEvidence(trinome.texFormeFactorisee)}$`
        handleAnswers(this, i, {
          reponse: {
            value: trinome.texFormeFactorisee,
            options: { factorisation: true },
          },
        })
      } else {
        let k = coefficient === 'un' ? 1 : randint(1, 5)
        const x1 = randint(-3, 3, [0])
        const y1 = randint(1, borne)
        if (coefficient === 'un' || choice(['+', '-']) === '+') {
          // k(x-x1)^2 + y1 avec k>0 et y1>0
          if (coefficient === 'autre' && k === 1) k = randint(2, 5)
          a = k
          b = -2 * k * x1
          c = k * x1 * x1 + y1
        } else {
          // -k(x-x1)^2 -y1 avec k>0 et y1>0
          a = -k
          b = 2 * k * x1
          c = -k * x1 * x1 - y1
        }
        texte = `$P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`

        texteCorr = `On a $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`
        texteCorr +=
          '<br>On reconnaît un polynôme du second degré. On cherche ses éventuelles racines en calculant son discriminant.'
        texteCorr +=
          "<br>$\\Delta<0$ donc le polynôme n'admet pas de racines réelles."
        texteCorr += `<br>D'après le cours, il n'est ${texteEnCouleurEtGras('pas factorisable')}.`
        handleAnswers(this, i, {
          reponse: { value: '\\text{Pas factorisable}' },
        })
      }
      texte +=
        '<br>' +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierFullOperations, {
          texteAvant: '$P(x)=$',
        })
      if (this.interactif && familles.includes('nonFactorisable')) {
        texte += boutonReponsePredefinie({
          numeroExercice: this.numeroExercice,
          indiceQuestion: i,
          label: 'Pas factorisable',
        })
      }

      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        if (type !== 'nonFactorisable') indiceFactorisable++
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
