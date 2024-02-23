// pega as exportações de react-dialog e coloca no objeto chamado Dialog
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface NewNoteCardProps {
    onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps){
    const [shouldShowOnBording, setShouldShowOnBording] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [content, setContent] = useState('') 

    function handleStartEditor(){
        setShouldShowOnBording(false);
    }

    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>){
        setContent(event.target.value);
        
        if(event.target.value === '') {
            setShouldShowOnBording(true);
        }
    }

    function handleSaveNote(event: FormEvent){
        event.preventDefault();

        if(content === ''){
            return
        }

        onNoteCreated(content); 

        // limpa o campo de texto
        setContent('');
        // volta para o estado inicial da tela
        setShouldShowOnBording(true);

        toast.success('Nota salva com sucesso!');
    }

    // função para iniciar a gravação
    function handleStartRecording(){

        // verifica se o navegador suporta a API de reconhecimento de voz
        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

        if(!isSpeechRecognitionAPIAvailable){
            alert('Seu navegador não suporta a API de gravação de voz.');
            return;
        }

        setIsRecording(true);
        setShouldShowOnBording(false);

        // pega a classe da API de gravação de voz
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        // cria uma nova instância da API de gravação de voz
        speechRecognition = new SpeechRecognitionAPI();

        // configura o idioma da gravação
        speechRecognition.lang = 'pt-BR';

        // configura a gravação para ser contínua até clicar para parar de gravar
        speechRecognition.continuous = true;

        // configura a gravação para retornar apenas a melhor alternativa de texto
        speechRecognition.maxAlternatives = 1;

        // configura a gravação para retornar resultados intermediários
        speechRecognition.interimResults = true;

        speechRecognition.onresult = (event) => {
            // pega o texto transcrito
            // o texto transcrito é retornado em partes, por isso é necessário concatenar
            // reduce é uma função que reduz um array para um único valor
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript);
            }, '');

            // atualiza o conteúdo da nota com o texto transcrito
            setContent(transcription);
        }   

        // configura a gravação para retornar um erro
        speechRecognition.onerror = (event) => {
            console.error(event.error);
        }

        // inicia a gravação
        speechRecognition.start();
    }

    //função para interromper a gravação
    function handleStopRecording(){
        setIsRecording(false);

        if(speechRecognition != null){
            // interrompe a gravação
            speechRecognition.stop();
        }
    }

    return(
        <Dialog.Root>
            <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
              <span className="text-sm font-medium text-slate-200 ">
                Adicionar nota
              </span>
              <p className="text-sm leading-6 text-slate-400">
                Grave uma nota em áudio que será convertida para texto automaticamente.
              </p>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-black/50"/>
                <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
                    <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                        <X className="size-5"/>
                    </Dialog.Close> 

                    <form className="flex-1 flex flex-col">
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <span className="text-sm font-medium text-slate-300 ">
                                Adicionar nota
                            </span>
                            
                            {shouldShowOnBording ? (
                                <p className="text-sm leading-6 text-slate-400">
                                Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline">gravando uma nota</button> em áudio ou se preferir <button onClick={ handleStartEditor } className="font-medium text-lime-400 hover:underline">utilize apenas texto</button>.
                                </p>
                            ) : (
                                <textarea 
                                autoFocus
                                className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                                onChange={handleContentChanged}
                                value={content} // valor do campo de texto
                                />
                    
                            )}
                        </div>

                        {isRecording ? (
                            <button 
                                type="button" 
                                onClick={handleStopRecording}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100">
                                <div className="size-3 rounded-full bg-red-500 animate-pulse"/>
                                Gravando (clique para interromper)
                            </button>   
                            ) : (
                                <button 
                                type="button" 
                                onClick={handleSaveNote}
                                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500">
                                Salvar nota
                        </button>
                            )}

                        
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}