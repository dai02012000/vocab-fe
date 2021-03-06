import {
	Box,
	Button,
	Container,
	Grid,
	IconButton,
	Pagination,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
	addVocabToList,
	getMyListDetail,
	removeVocabInList,
	updateVocabInList
} from '../services/listService';
import { ListReturn, Vocab } from '../types/list';
import SearchIcon from '@mui/icons-material/Search';
import _ from 'lodash';
import { SIZE_PAGINATION } from '../constants/constans';
import EditIcon from '@mui/icons-material/Edit';
import VocabDialog from './VocabDialog';
import { useSnackbar } from 'notistack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

function MyListDetail() {
	const { id } = useParams<{ id: string }>();
	const [list, setList] = useState<ListReturn | undefined>();
	const [listShow, setListShow] = useState<Vocab[] | undefined>();
	const [openEdit, setOpenEdit] = useState(false);
	const [newVocab, setNewVocab] = useState<Vocab | undefined>();
	const [vocab, setVocab] = useState('');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalPage, setTotalPage] = useState(1);
	const [openDetele, setOpenDelete] = useState(false);

	const { enqueueSnackbar } = useSnackbar();

	const getData = async () => {
		const { data } = await getMyListDetail(id);
		setList(data);
	};
	console.log('list', list);
	console.log('listShow', listShow);

	// const debounce = _.debounce((search: string) => {
	// 	setSearch(search);
	// }, 1000);

	useEffect(() => {
		getData();
	}, [id]);

	useEffect(() => {
		if (list) {
			let vocab = [...list.vocab].filter(v => v.word.match(new RegExp(search)));

			// let newListShow = list?.vocab.filter(v =>
			// 	v.word.match(new RegExp(search))
			// );
			console.log('newListShow', vocab);
			setTotalPage(
				Math.ceil(vocab.length / SIZE_PAGINATION) === 0
					? 1
					: Math.ceil(vocab.length / SIZE_PAGINATION)
			);

			setListShow(vocab);
			// console.log(list?.vocab.filter(v => v.word.match(new RegExp(search))));
		}
	}, [search, list]);

	const handleOpenEditDialog = (word: string) => {
		setVocab(word);
		setOpenEdit(true);
	};

	const handleCloseEditDialog = () => {
		setOpenEdit(false);
		setVocab('');
	};

	const handleEdit = async (newVocab: Vocab) => {
		let flag = true;
		try {
			console.log('data', {
				name: list?.name as string,
				oldVocab: list?.vocab.find(v => v.word === vocab) as Vocab,
				newVocab
			});

			await updateVocabInList({
				name: list?.name as string,
				oldVocab: list?.vocab.find(v => v.word === vocab) as Vocab,
				newVocab
			});
			enqueueSnackbar('C???p nh???t t??n list th??nh c??ng', { variant: 'success' });
		} catch (error) {
			console.log(error);
			enqueueSnackbar('C?? l???i x???y ra', { variant: 'error' });
			flag = false;
		}

		if (flag) {
			const newVocabs = list?.vocab.map(v => {
				if (v.word === vocab) {
					v = newVocab;
				}
				return v;
			});
			const newList = { ...list };
			newList.vocab = newVocabs;
			setList(newList as ListReturn);
			setOpenEdit(false);
			setVocab('');
		}
	};

	const handleChange = (
		evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const name = evt.target.name;
		const newValue = evt.target.value;
		setNewVocab({ ...newVocab, ...{ [name]: newValue } } as Vocab);
	};

	const handleAddNewVocab = async () => {
		let flag = true;
		try {
			await addVocabToList({
				name: list?.name as string,
				vocab: [newVocab as Vocab]
			});
			enqueueSnackbar('C???p nh???t t??n list th??nh c??ng', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('C?? l???i x???y ra', { variant: 'error' });
			flag = false;
		}

		if (flag) {
			const newList = { ...list } as ListReturn;
			newList.vocab.push(newVocab as Vocab);
			setList(newList);
			setNewVocab(undefined);
		}
	};

	const handleOpenDeleteDialog = (word: string) => {
		setVocab(word);
		setOpenDelete(true);
	};

	const handleCloseDialog = () => {
		setOpenDelete(false);
		setVocab('');
	};

	const handleDelete = async () => {
		let flag = true;
		console.log('data', {
			name: list?.name as string,
			vocab: list?.vocab.find(v => (v.word = vocab)) as Vocab
		});
		console.log('vocab', vocab);
		try {
			const result = await removeVocabInList({
				name: list?.name as string,
				vocab: list?.vocab.find(v => v.word === vocab) as Vocab
			});
			console.log('result', result);

			enqueueSnackbar('X??a t??? th??nh c??ng', { variant: 'success' });
		} catch (error) {
			console.log(error);
			enqueueSnackbar('C?? l???i x???y ra', { variant: 'error' });
			flag = false;
		}

		if (flag) {
			const newList = { ...list } as ListReturn;
			newList.vocab = newList.vocab.filter(v => v.word !== vocab);
			setList(newList);
			setOpenDelete(false);
			setVocab('');
		}
	};

	return (
		<Container maxWidth="xl">
			<Box mx={10}>
				<Typography my={2} variant="h4" sx={{ color: '#1976d2' }}>
					{list?.name}
				</Typography>
				<Box marginTop={3}>
					<Box sx={{ display: 'flex', marginBottom: 5 }}>
						<TextField
							sx={{ background: 'white' }}
							margin="none"
							value={search}
							onChange={e => {
								setSearch(e.target.value);
								// debounce(e.target.value);
							}}
							placeholder="T??m list"
							InputProps={{
								endAdornment: (
									<IconButton sx={{ p: '10px' }} aria-label="search">
										<SearchIcon />
									</IconButton>
								)
							}}
							size="medium"
							fullWidth
						/>
						<Button
							// component={Link}
							// to="/create-list"
							disabled={!!newVocab}
							sx={{ mx: 3, whiteSpace: 'nowrap' }}
							variant="contained"
							onClick={() => {
								setNewVocab({
									word: '',
									meaning: '',
									example: ''
								});
							}}
						>
							Th??m t??? m???i
						</Button>
						{list?.public === 0 && (
							<Button
								component={Link}
								to="/create-list"
								sx={{ mr: 3, whiteSpace: 'nowrap' }}
								variant="contained"
							>
								Y??u c???u public
							</Button>
						)}
					</Box>
				</Box>
				{newVocab && (
					<Grid container spacing={2} mb={2}>
						<Grid item xs={3}>
							<TextField
								fullWidth
								sx={{ marginRight: 2 }}
								label="T??? ti???ng anh"
								id="Word"
								name="word"
								value={newVocab.word}
								onChange={handleChange}
							/>
						</Grid>
						<Grid item xs={3}>
							<TextField
								fullWidth
								sx={{ marginRight: 2 }}
								label="Ngh??a ti???ng vi???t"
								id="Meaning"
								name="meaning"
								onChange={handleChange}
								defaultValue={newVocab.meaning}
							/>
						</Grid>
						<Grid item xs={5}>
							<TextField
								fullWidth
								label="V?? d???"
								id="Example"
								name="example"
								onChange={handleChange}
								defaultValue={newVocab.example}
							/>
						</Grid>
						<Grid item xs={1} mt={1}>
							<IconButton
								onClick={handleAddNewVocab}
								disabled={
									!newVocab.word || !newVocab.meaning || !newVocab.example
								}
							>
								{!newVocab.word || !newVocab.meaning || !newVocab.example ? (
									<AddCircleIcon />
								) : (
									<AddCircleIcon color="primary" />
								)}
							</IconButton>
						</Grid>
					</Grid>
				)}
				<Box>
					<TableContainer component={Paper}>
						<Table sx={{ minWidth: 650 }} aria-label="simple table">
							<TableHead>
								<TableRow>
									<TableCell>T??? v???ng</TableCell>
									<TableCell align="left">Ngh??a c???a t???</TableCell>
									<TableCell sx={{ ml: 30 }} align="left">
										V?? d???
									</TableCell>
									<TableCell align="right"></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{listShow &&
									(listShow as Vocab[])
										.slice((page - 1) * SIZE_PAGINATION, page * SIZE_PAGINATION)
										.map((vocab, index) => (
											<TableRow
												key={index}
												sx={{
													'&:last-child td, &:last-child th': { border: 0 },
													cursor: 'pointer',
													textDecoration: 'none',
													color: 'white'
												}}
												hover
												classes={{ hover: 'cursor' }}
											>
												<TableCell align="left" style={{ width: 220 }}>
													<Typography variant="h4">{vocab.word}</Typography>
												</TableCell>
												<TableCell align="left" style={{ width: 220 }}>
													<Typography variant="h4">{vocab.meaning}</Typography>
												</TableCell>
												<TableCell sx={{ ml: 30 }} align="left">
													<Typography variant="h4">{vocab.example}</Typography>
												</TableCell>
												<TableCell align="right">
													<IconButton
														// to={`/admin/books/${list.id}`}
														// component={Link}
														onClick={() => handleOpenEditDialog(vocab.word)}
													>
														<EditIcon />
													</IconButton>
													<IconButton
														onClick={() => handleOpenDeleteDialog(vocab.word)}
													>
														<DeleteIcon sx={{ color: '#F26464' }} />
													</IconButton>
												</TableCell>
											</TableRow>
										))}
							</TableBody>
						</Table>
					</TableContainer>
					<Box
						alignItems="center"
						sx={{
							'& ul': {
								margin: 2,
								justifyContent: 'center',
								position: 'fixed',
								bottom: 5,
								right: '40%'
							}
						}}
					>
						<Pagination
							count={totalPage}
							page={page || 1}
							onChange={(_, value: number) => {
								setPage(value);
							}}
						/>
					</Box>
					<VocabDialog
						open={openEdit}
						oldVocab={list?.vocab.find(v => v.word === vocab)}
						onClose={handleCloseEditDialog}
						onEdit={handleEdit}
					/>
					<ConfirmDeleteDialog
						open={openDetele}
						onClose={handleCloseDialog}
						onDelete={handleDelete}
					/>
				</Box>
			</Box>
		</Container>
	);
}

export default MyListDetail;
