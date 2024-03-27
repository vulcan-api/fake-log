const router = require('express').Router({})
const protocol = require('../../utils/connection')
const { getUnixTime, format } = require('date-fns')
const api = require('../../utils/api')

router.all('/Certyfikat', (req, res) => {
  const base = protocol(req) + '://' + req.get('host')

  // key gen
  // keytool -genkeypair -keystore myKeystore.p12 -storetype PKCS12 -storepass 012345678901234567890123456789AB -alias LoginCert -keyalg RSA -keysize 2048 -sigalg SHA1WithRSA -validity 99999 -dname "CN=Wulkanowy, OU=Wulkanowy, O=Wulkanowy, L=Jaroslaw, ST=podkarpackie, C=WLKNW" -ext san=dns:fakelog.cf,dns:localhost,ip:127.0.0.1

  res.json({
    IsError: false,
    IsMessageForUser: false,
    Message: null,
    TokenKey: null,
    TokenStatus: 'CertGenerated',
    TokenCert: {
      CertyfikatKlucz: '7EBA57E1DDBA1C249D097A9FF1C9CCDD45351A6A',
      CertyfikatKluczSformatowanyTekst: '7E-BA-57-E1-DD-BA-1C-24-9D-09-7A-9F-F1-C9-CC-DD-45-35-1A-6A',
      CertyfikatDataUtworzenia: Math.round(new Date().getTime() / 1000),
      CertyfikatDataUtworzeniaSformatowanyTekst: new Date().toUTCString(),
      CertyfikatPfx:
        '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',
      GrupaKlientow: 'powiatwulkanowy',
      AdresBazowyRestApi: base + '/powiatwulkanowy/',
      UzytkownikLogin: 'admin',
      UzytkownikNazwa: 'admin',
      TypKonta: null,
    },
  })
})

router.all('/ListaUczniow', (req, res) => {
  const currDate = new Date()

  let semesterNumber
  let semesterStart
  let semesterEnd
  if (currDate.getMonth() >= 8) {
    semesterNumber = 1
    semesterStart = new Date(currDate.getFullYear(), 8, 1)
    semesterEnd = new Date(currDate.getFullYear() + 1, 0, 30)
  } else {
    semesterNumber = 2
    semesterStart = new Date(currDate.getFullYear(), 0, 30)
    semesterEnd = new Date(currDate.getFullYear(), 7, 31)
  }

  res.json(
    api.createResponse(
      require('../../../data/api/ListaUczniow').map((item) => {
        return {
          ...item,
          OkresNumer: semesterNumber,
          OkresDataOd: getUnixTime(semesterStart),
          OkresDataDo: getUnixTime(semesterEnd),
          OkresDataOdTekst: format(semesterStart, 'yyyy-MM-dd'),
          OkresDataDoTekst: format(semesterEnd, 'yyyy-MM-dd'),
        }
      })
    )
  )
})

module.exports = router
