module docsign::document {
    use sui::event;
    use sui::object;
    use sui::tx_context;
    use std::string::{Self, String};

    /// A document that needs to be signed
    public struct Document has key, store {
        id: object::UID,
        doc_id: String,
        owner: address,
    }

    public struct DocumentRegisteredEvent has copy, drop, store {
        doc_id: String,  // Changed from address to String
        owner: address,
    }

    public struct DocumentSignedEvent has copy, drop, store {
        doc_id: String,  // Changed from address to String
        signer: address,
        signature: vector<u8>,
    }

    /// Register a new document and transfer ownership to the sender
    public entry fun register_document(
        doc_id: String,  // Changed from address to String
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let document = Document {
            id: object::new(ctx),
            doc_id: copy doc_id,
            owner,
        };
        
        transfer::transfer(document, owner);
        
        event::emit(DocumentRegisteredEvent {
            doc_id: copy doc_id,
            owner,
        });
    }

    public entry fun sign_document(
        doc_id: String,  // Changed from address to String
        signature: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        let signer = tx_context::sender(ctx);
        event::emit(DocumentSignedEvent { 
            doc_id: copy doc_id, 
            signer, 
            signature 
        });
    }
}