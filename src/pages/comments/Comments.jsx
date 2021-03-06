import React, { useState, useEffect, Fragment } from 'react'
import { StyledRedButton } from '../../StyledComponents';
import { useParams } from 'react-router';
import { Checkbox, Form, TextArea } from 'semantic-ui-react'
import { getComments, getDocument, toggleCommentApproval,deleteComment } from '../../utility/api';
import Loader from '../../components/Loader/Loader';
import { getPusher } from '../../utility/utility';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const Comments = ({ isPost, isVideo }) => {
    let docType;
    if (isPost) {
        docType = 'post'
    }
    if (isVideo) {
        docType = 'video'
    }

    const params = useParams();
    const [comments, setComments] = useState([]);
    const [document, setDocument] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const getInitialData = async () => {
        const docId = params.id;
        await getDocument(docId, docType, setDocument, setIsLoading);
        await getComments(docId, docType, setComments, setIsLoading);
    }

    useEffect(() => {
        getInitialData()

        const channel = getPusher().subscribe("my-channel");
        channel.bind("CommentsUpdated", async (data) => {
            console.log('data', data)
            getInitialData()
        });
    }, [])

    // export const deleteComment = async (id, setIsLoading) => {
    //     setIsLoading(true)

    //     setIsLoading(false)
    // }


    const handleDeleteComment = async (id) => {
        const docId = params.id;
        await deleteComment(id, setIsLoading)
        await getComments(docId, docType, setComments, setIsLoading);
    }


    const handleCommentApproval = async (id) => {
        const docId = params.id;
        await toggleCommentApproval(id, setIsLoading)
        await getComments(docId, docType, setComments, setIsLoading);
    }

    return (
        <div style={{ margin: 'auto', maxWidth: 800 }}>
            {isLoading && <div style={{ position: 'fixed', zIndex: 5, top: '50%', left: '50%', transform: 'translateX(-50%)' }}><Loader /></div>}
            <h1>{capitalizeFirstLetter(docType)} Comments from {document.title}</h1>
            <table style={{ margin: 'auto', width: '100%' }}>
                <tbody>

                    <tr><th></th><th style={{ fontSize: '1.2em' }}>User</th><th style={{ fontSize: '1.2em' }}>E-mail</th><th style={{ fontSize: '1.2em', textAlign: 'center' }}>Approved</th></tr>

                    {comments.map((c, i) => (
                        <Fragment key={c.id}>
                            <tr style={{
                                height: 60,
                                padding: 20,
                            }} key={c.id}>
                                <td>{i + 1}</td>

                                <td>{c.user}</td>
                                <td>{c.email}</td>
                                <td> <div style={{ display: 'flex', justifyContent: 'space-around' }}><Checkbox checked={!!c.is_approved} onChange={() => handleCommentApproval(c.id)} /></div></td>
                                <td><StyledRedButton onClick={() => handleDeleteComment(c.id)}>Delete</StyledRedButton> </td>
                            </tr>
                            <tr style={{
                                height: 60,
                                padding: 10,

                                width: '100%',
                                margin: 20
                            }}
                            >
                                <td></td>
                                <td colSpan="4">
                                    <Form><TextArea value={c.content} onChange={() => console.log('disabled input')} style={{ minHeight: 100, width: '100%' }} /></Form>
                                    {/* <textarea readOnly rows="4" cols="50" style={{
                                        fontWeight: 600,
                                        border: 'none',
                                        background: '#efefef',
                                        fontFamily: 'Mulish',
                                        fontSize: '1.1em',
                                        lineHeight: 1.8,
                                    }}>
                                        {c.content}
                                    </textarea> */}
                                </td>
                            </tr>
                        </Fragment>
                    ))}

                </tbody>
            </table>
        </div >
    )
}

export default Comments;
