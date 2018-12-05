const Alexa = require('ask-sdk-core')

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    if(supportsDisplay(handlerInput)) {
      const image = new Alexa.ImageHelper()
        .addImageInstance('https://s3-ap-northeast-1.amazonaws.com/alitaso-slot/twitter_icon.png')
        .getImage()

      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText('ありたそのアイコンです')
        .getTextContent()

      handlerInput.responseBuilder.addRenderTemplateDirective({
        type: 'BodyTemplate1',
        token: 'string',
        backButton: 'HIDDEN',
        backgroundImage: image,
        title: 'alitaso-slot',
        textContent: primaryText
      })

      return handlerInput.responseBuilder
        .speak(WELCOME_MESSAGE)
        .getResponse()
    }

    return handlerInput.responseBuilder
      .speak('ディスプレイ未対応です')
      .getResponse()
  }
}

const SlotRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' && request.intent.name === 'SlotIntent'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .getResponse()
  }
}

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse()
  }
}

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' && (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent')
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .getResponse()
  }
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    console.log(`The session ended: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse()
  }
}

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`)

    return handlerInput.responseBuilder
      .speak('何を言っているのか理解できませんでした')
      .reprompt('何を言っているのか理解できませんでした')
      .getResponse();
  }
}

const WELCOME_MESSAGE = 'ありたそスロットへようこそ'
const HELP_MESSAGE = 'ありたそスロット、と言ってみてください。スロットで遊ぶことができます。'
const HELP_REPROMPT = 'ご用件はなんでしょうか？'

const skillBuilder = Alexa.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SlotRequestHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()

function supportsDisplay(handlerInput) {
  const context = handlerInput.requestEnvelope.context
  return context.System.device.supportedInterfaces.Display
}