const Alexa = require('ask-sdk-core')

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    if (supportDisplay(handlerInput)) {
      return handlerInput.responseBuilder
        .speak(WELCOME_MESSAGE)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          version: '1.0',
          document: require('./document.json'),
          datasources: makeDatasources()
        })
        .getResponse()
    } else {
      return handlerInput.responseBuilder
        .speak('このスキルは画面なしのデバイスには対応していません')
        .getResponse()
    }
  }
}

const SlotRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' && request.intent.name === 'SlotIntent'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        version: '1.0',
        document: require('./document.json'),
        datasources: makeDatasources()
      })
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

const WELCOME_MESSAGE = 'ありたそスロットへようこそ。スロットを回します。'
const HELP_MESSAGE = 'スロットを回して、と言ってみてください。スロットで遊ぶことができます。'
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

function supportDisplay(handlerInput) {
  const hasDisplay =
    handlerInput.requestEnvelope &&
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display

    return hasDisplay
}

function makeDatasources() {
  const sources = [
    { url: "https://s3-ap-northeast-1.amazonaws.com/alitaso-slot/twitter_icon.png" },
    { url: "https://s3-ap-northeast-1.amazonaws.com/alitaso-slot/twitter_icon2.png" },
    { url: "https://s3-ap-northeast-1.amazonaws.com/alitaso-slot/twitter_icon3.png" },
    { url: "https://s3-ap-northeast-1.amazonaws.com/alitaso-slot/twitter_icon4.png" }
  ]

  const slotedSources = sources.map(_ => {
    const index = Math.floor(Math.random() * sources.length)
    return sources[index]
  })

  const datasources = {
    data: {
      type: "object",
      properties: {
        sources: slotedSources
      }
    }
  }

  return datasources
}