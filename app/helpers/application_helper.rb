module ApplicationHelper
  def setResponseMessage(messageType, messageContent)
    cookies[:message_type] = messageType.to_s
    cookies[:message_content] = messageContent.to_s
  end
end
