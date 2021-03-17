const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $input = document.querySelector('#input')
const $messageFormButton = document.querySelector('#increment')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight


    // height of messsages continaer
    const containerHeight = $messages.scrollHeight

    // How far have i scrolles?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin)
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (locationMessage) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: locationMessage.username,
        url: locationMessage.url,
        createdAt: moment(locationMessage.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm
    .addEventListener('submit', (e) => {
        e.preventDefault()

        $messageFormButton.setAttribute('disabled', 'disabled')

        socket.emit('sendMessage', $input.value, (error) => {

            $messageFormButton.removeAttribute('disabled')
            $input.value = ''
            $input.focus()

            if (error) {
                return console.log(error)
            }
            console.log('the message was delivered')
        })
    })

$sendLocationButton
    .addEventListener('click', () => {
        if (!navigator.geolocation) {
            return alert('Geolocation is not supported by your browser')
        }
        $sendLocationButton.setAttribute('disabled', 'disabled')
        navigator.geolocation.getCurrentPosition((position) => {
            console.log(position)
           socket.emit('sendLocation',
               `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
               () => {
                $sendLocationButton.removeAttribute('disabled')
                console.log('location shared')
               })
        })
    })

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})