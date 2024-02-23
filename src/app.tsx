import { NewNoteCard } from './components/new-note-card';
import { NoteCard } from './components/note-card';
import { useState } from 'react';

// define a estrutura de uma nota
interface Note{
  id: string,
  date: Date,
  content: string,
}

export function App() {

  // estado para armazenar o valor do campo de pesquisa
  const [search, setSearch] = useState('')

  // estado para armazenar as notas
  const [notes, setNotes] = useState<Note[]>(() => {
    // pega as notas salvas no localStorage do navegador
    const notesOnStorage = localStorage.getItem('notes');

    // verifica se existem notas salvas
    if(notesOnStorage){
      // converte as notas de volta para um array
      return JSON.parse(notesOnStorage);
    }

    return []
  })


  // função para criar uma nova nota
  function onNoteCreated(content: string){
    // cria uma nova nota com as estrutura aprensentada na interface acima
    const newNote = {
      // gera um id único para a nota
      id: crypto.randomUUID(),
      date: new Date(),
      content
    }

    // atualiza o estado de notes com a nova nota e a nova nota sempre ficará a frente das outras
    const notesArray = [newNote, ...notes];
    setNotes(notesArray);

    // salva as notas no localStorage do navegador
    localStorage.setItem('notes', JSON.stringify(notesArray));
  }

  // função para deletar uma nota
  function onNoteDeleted(id: string){
    // filtra as notas para remover a nota com o id passado
    const notesArray = notes.filter(note => {
      // retorna todas as notas que não tem o id passado
      return note.id !== id;
    })

    // atualiza o estado de notes com o novo array de notas
    setNotes(notesArray);

    // salva as notas no localStorage do navegador
    localStorage.setItem('notes', JSON.stringify(notesArray));
  }


  // atualiza o estado de search com o valor do campo de texto
  function handleSearch(event: React.ChangeEvent<HTMLInputElement>){
    // pega o valor do campo de texto
    const query = event.target.value;
    // atualiza o estado de search com o valor do campo de texto
    setSearch(query);
  }

  // filtra as notas de acordo com o valor de search
  const filteredNotes = search != '' 
    ? notes.filter(note => note.content.toLowerCase().includes(search.toLowerCase())) 
    : notes;

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      <form className="w-full mt-6">
        <input 
          type="text" 
          placeholder="Busque em suas notas"
          className = "w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder: text-slate-500"
          // atualiza o estado de search com o valor do campo de texto
          onChange={handleSearch}
        />
      </form>

      <div className="h-px bg-slate-700"/>

      <div className="grid grid-col-1 md:grid-col-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
      
      <NewNoteCard onNoteCreated={onNoteCreated} />

      {filteredNotes.map(note => {
        return (<NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted}/>);
      })} 

        
      </div>
    </div>
  )
}


 