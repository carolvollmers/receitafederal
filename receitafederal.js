

const puppeteer = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const xlsx = require("xlsx");


puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: '329ad5e37e01d36cfb94a997eb6ca0ba' 
    },
    visualFeedback: true 
  })
)


  puppeteer.launch({ headless: true }).then(async browser => {

  var wb = xlsx.readFile("CPF-clientes.xlsx",{cellDates:true});
  var ws = wb.Sheets["Lista"];
  var data = xlsx.utils.sheet_to_json(ws);r
  
  const page = await browser.newPage()
  await page.goto('https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp');

  var i = 0;
  for (; i < data.length; i++) {

    var CPF = String(data[i].CPF)
    var Birth = String(data[i].Birth)

    await page.type("input#txtCPF", CPF)
    await page.type("input#txtDataNascimento", Birth)

    await page.click("iframe")
  
    await page.solveRecaptchas()

    await Promise.all([
    page.waitForNavigation(),
    page.click('input[id="id_submit"]')
    ])


    var file_name = "./"+String(data[i].Name)+".pdf"

    await page.pdf({path: file_name, format: 'A4', printBackground: true});

    page.click('a.no-display-print')
    await page.waitForTimeout(3000);
  }
  
  await browser.close()
})