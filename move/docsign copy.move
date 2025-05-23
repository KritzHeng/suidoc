module docsign::document {
    use sui::event;
    use sui::object;
    use sui::tx_context;

    /// A document that needs to be signed
    public struct Document has key, store {
        id: object::UID,
        doc_hash: vector<u8>,
        cid: vector<u8>,
        owner: address,
    }

    public struct DocumentRegisteredEvent has copy, drop, store {
        doc_hash: vector<u8>,
        owner: address,
        cid: vector<u8>,
    }

    public struct DocumentSignedEvent has copy, drop, store {
        doc_hash: vector<u8>,
        signer: address,
        signature: vector<u8>,
    }

    /// Register a new document and transfer ownership to the sender
    public entry fun register_document(
        doc_hash: vector<u8>,
        cid: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let document = Document {
            id: object::new(ctx),
            doc_hash,
            cid,
            owner,
        };
        
        transfer::transfer(document, owner);
        
        event::emit(DocumentRegisteredEvent {
            doc_hash: copy doc_hash,
            owner,
            cid: copy cid,
        });
    }

    public entry fun sign_document(
        doc_hash: vector<u8>,
        signature: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        let signer = tx_context::sender(ctx);
        event::emit(DocumentSignedEvent { doc_hash, signer, signature });
    }
}