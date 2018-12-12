const Alexa = require('ask-sdk-core')

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    if (!supportDisplay(handlerInput)) {
      return handlerInput.responseBuilder
        .speak('このスキルは画面なしのデバイスには対応していません')
        .getResponse()
    }

    return handlerInput.responseBuilder
      .speak(WELCOME_MESSAGE)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        version: '1.0',
        document: require('./document.json'),
        datasources: makeDatasources(handlerInput, true)
      })
      .withShouldEndSession(false)
      .getResponse()
  }
}

const SlotRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' && (request.intent.name === 'SlotIntent' || request.intent.name === 'AMAZON.NextIntent')
  },
  handle(handlerInput) {
    if (!supportDisplay(handlerInput)) {
      return handlerInput.responseBuilder
        .speak('このスキルは画面なしのデバイスには対応していません')
        .getResponse()
    }

    return handlerInput.responseBuilder
      .speak('よかったですね。もう一度スロットを回しますか？')
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        version: '1.0',
        document: require('./document.json'),
        datasources: makeDatasources(handlerInput, false)
      })
      .withShouldEndSession(false)
      .getResponse()
  }
}

const PreviousRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PreviousIntent'
  },
  handle(handlerInput) {
    if (!supportDisplay(handlerInput)) {
      return handlerInput.responseBuilder
        .speak('このスキルは画面なしのデバイスには対応していません')
        .getResponse()
    }

    const attributes = handlerInput.attributesManager.getSessionAttributes()
    if (!attributes.previousDatasources) {
      return handlerInput.responseBuilder
        .speak('スロット履歴がありません。スロットを回しますか？')
        .reprompt('スロット履歴がありません。スロットを回しますか？')
        .getResponse()
    }

    return handlerInput.responseBuilder
      .speak('前回のスロット履歴はこちらです。もう一度スロットを回しますか？')
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        version: '1.0',
        document: require('./document.json'),
        datasources: attributes.previousDatasources
      })
      .withShouldEndSession(false)
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
    return request.type === 'IntentRequest' && (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'NoIntent')
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('さようなら。また遊びましょうね。')
      .withSimpleCard('ありたそスロット', 'さようなら')
      .withShouldEndSession(true)
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
    return handlerInput.responseBuilder.withShouldEndSession(true).getResponse()
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
      .withShouldEndSession(true)
      .getResponse();
  }
}

const WELCOME_MESSAGE = 'ありたそスロットへようこそ。もう一度スロットを回しますか？'
const HELP_MESSAGE = 'スロットを回して、と言ってみてください。スロットで遊ぶことができます。なおこのスキルは画面のないデバイスには対応していません。'
const HELP_REPROMPT = 'ご用件はなんでしょうか？'

const skillBuilder = Alexa.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SlotRequestHandler,
    PreviousRequestHandler,
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

function makeDatasources(handlerInput, initialSlot) {
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

  // セッションの保存
  let attributes = handlerInput.attributesManager.getSessionAttributes()
  if (initialSlot) {
    attributes.nextDatasources = datasources
  } else {
    attributes.previousDatasources = attributes.nextDatasources
    attributes.nextDatasources = datasources
  }

  return datasources
}