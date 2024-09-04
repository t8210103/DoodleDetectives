import React, { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Eraser, Pen, Redo, Undo, RotateCcw } from 'lucide-react'
import { useWebSocketContext } from './WebSocketContext.js';

export default function Canvas({ canEdit, game, clientId }) {

  const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();

  const colorInputRef = useRef(null); // No need for HTMLInputElement typing
  const canvasRef = useRef(null); // No need for ReactSketchCanvasRef typing
  const base64String = useRef(null)
  const [strokeColor, setStrokeColor] = useState('#203354');
  const [eraseMode, setEraseMode] = useState(false);
  const client = game.clients.find(client => client.userData && client.userData.clientId === clientId);
  let base64;
    
  if (client) {
    base64 = client.userData.base64String;
  }
  
  base64String.current = base64;

  const handleStrokeColorChange = (event) => {
    setStrokeColor(event.target.value); // Update the state with the new color
  };

  const handleEraserClick = () => {
    setEraseMode(true);
    canvasRef.current?.eraseMode(true);
  }

  const handlePenClick = () => {
    setEraseMode(false);
    canvasRef.current?.eraseMode(false);
  }

  const handleUndoClick = () => {
    canvasRef.current?.undo();
  }

  const handleRedoClick = () => {
    canvasRef.current?.redo();
  }

  const handleClearClick = () => {
    canvasRef.current?.clearCanvas();
  }

  const whiteImage = (event)  => {
    event.target.src = '/images/solidWhite.png';
  }
  
  async function checkAI() {

    if (canvasRef.current) {

      const dataURL = await canvasRef.current?.exportImage('png') // dataURL is base64String
      const base64String = dataURL.split(',')[1];

      const payload = {
        "method": "checkAI",
        "game": game,
        "clientId": clientId,
        "base64String": base64String
      }

      sendJsonMessage(payload);

      return base64String;
    }

  }

  async function updateDrawing() {

    const dataURL = await canvasRef.current?.exportImage('png') // dataURL is base64String
    
    if (!dataURL) {
      console.error("Failed to export image, dataURL is undefined.");
      return;
    }

    base64String.current = dataURL.split(',')[1];

    const payload = { //see if it works amesa
      "method": "updateDrawing",
      "game": game,
      "clientId": clientId,
      "base64String": base64String.current
    }

    sendJsonMessage(payload);
  }

  useEffect(() => {

    if (lastJsonMessage != null) {

      const response = lastJsonMessage;

      if (response.method === "resultAI") {

        if (response.found) {
          console.log("You won");
        } else {
          console.log("Keep trying");
        }

      }

    }

    let imgElement = document.getElementById('base64Image');
    const client = game.clients.find(client => client.userData && client.userData.clientId === clientId);
    imgElement.src = `data:image/png;base64,${client.userData.base64String}`;
    //console.log(base64String)

  }, [lastJsonMessage, game, clientId])

  return (
    <div className='mt-6 flex max-w-2xl gap-4'>
      {/* player data / left side */}
      {canEdit && (
        <ReactSketchCanvas
          width='100%'
          height='430px'
          ref={canvasRef}
          strokeColor={strokeColor}
          canvasColor='transparent'
          className='!rounded-2xl !border-purple-500 dark:!border-purple-800'
          onStroke={updateDrawing}
        />
      )}
        
      {canEdit && (
        <div className='flex flex-col items-center gap-y-6 divide-y'>
          
          {/* color picker */}
          <button
            size='icon'
            onClick={() => colorInputRef.current && colorInputRef.current.click()}
            style={{ backgroundColor: strokeColor }} // Button background color matches selected color
          >
            <input
              type='color'
              ref={colorInputRef}
              style={{
                backgroundColor: strokeColor,
                border: 'none',
                padding: '0px',
              }}
              value={strokeColor}
              onChange={handleStrokeColorChange} // Update color on change
            />
          </button>
          
          {/* drawing mode */}
          <div className='flex felx-col gap-3 pt-6'>
          <button
            size='icon'
            type='button'
            variant='outline'
            disabled={!eraseMode}
            onClick={handlePenClick}
          >
            <Pen size={16}/>
          </button>
          <button
            size='icon'
            type='button'
            variant='outline'
            disabled={eraseMode}
            onClick={handleEraserClick}
          >
            <Eraser size={16}/>
          </button>
          </div>

          {/* actions */}
          <div className='flex flex-col gap-3 pt-6'>
            <button
              size='icon'
              type='button'
              variant='outline'
              onClick={handleUndoClick}
            >
              <Undo size={16}/>
            </button>
            <button
              size='icon'
              type='button'
              variant='outline'
              onClick={handleRedoClick}
            >
              <Redo size={16}/>
            </button>

            <button
              size='icon'
              type='button'
              variant='outline'
              onClick={handleClearClick}
            >
              <RotateCcw size={16}/>
            </button>
            
            {/* Can also be done with onStroke(), so on each stroke in checks - high API cost */}
            <button
              size='16px'
              type='button'
              variant='outline'
              onClick={checkAI}
              className='aiCheck-btn'
            >
              AI check
            </button>
          </div>
        </div>
      )}

      {/* Opponent data / right side */}
      {!canEdit && (
        <div>
          <h4>In Opp data:</h4>
          <img id="base64Image" alt="Opponents drawing" onError={whiteImage}/>
        </div>
      )}
    </div>  
  );
}
